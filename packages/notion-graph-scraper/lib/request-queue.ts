import to from "await-to-js"
import EventEmitter from "events"
import { createLogger } from './logger';

/**
 * https://developers.notion.com/reference/request-limits
 * Notion API has a request limit
 * also, although we are using unofficial API,
 * it's a good idea not to overload the server too much anyway
 * So use a simple request queue to control number of concurrent requests
 */
export class RequestQueue<Res, Err> {
  private queue: (() => Promise<Res>)[] = []
  private responses: (Res | Err)[] = []
  private currentRequestCount = 0
  /**
   * Once you reach max request count,
   * it will send no more requests
   */
  private maxRequestCount = Infinity
  private maxConcurrentRequest = -1
  private eventEmitter = new EventEmitter()
  private lastRequestTimeoutMs: number
  private intervalId: NodeJS.Timer | null = null
  private hasNoMoreRequestEnqueued = false
  private externalSuccessfulRequestCount = 0
  private totalSuccessfulRequestCount = 0
  private logger: ReturnType<typeof createLogger>
  constructor({
    maxConcurrentRequest,
    maxRequestCount = Infinity,
    lastRequestTimeoutMs = 15_000,
    logger,
  }: {
    maxConcurrentRequest: number
    /**
     * default: 15000 ms
     */
    lastRequestTimeoutMs?: number
    maxRequestCount?: number
    logger: ReturnType<typeof createLogger>
  }) {
    if (maxConcurrentRequest <= 0) {
      throw new Error(`maxConcurrentRequest must be bigger than 0`)
    }
    this.maxConcurrentRequest = maxConcurrentRequest
    this.lastRequestTimeoutMs = lastRequestTimeoutMs
    this.maxRequestCount = maxRequestCount
    this.logger = logger
    this.checkAndSendRequest()
  }

  private terminate() {
    this.eventEmitter.emit(`complete`, this.responses)
    if (this.intervalId) clearInterval(this.intervalId)
  }

  private terminateIfPossible() {
    if (this.currentRequestCount === 0 && this.queue.length === 0) {
      this.terminate()
    }
  }

  /**
   * This function is used to periodically check the number of concurrent
   * requests at a time and send the request if the number of concurrent requests
   * is less than `maxConcurrentRequest`.
   *
   * If there are no more requests to send, it will emit `complete` event and terminate.
   */
  private checkAndSendRequest() {
    let timeoutIds: NodeJS.Timeout[] = []
    let totalRequestCount = 0
    const run = () => {
      // wait until external requests finish
      if (
        this.externalSuccessfulRequestCount !== 0 &&
        this.totalSuccessfulRequestCount !== 0 &&
        this.externalSuccessfulRequestCount < this.totalSuccessfulRequestCount
      ) {
        return
      }
      this.logger?.(
        `# current requests: ${this.currentRequestCount} / # items in the queue: ${this.queue.length}`
      )
      this.logger?.(`# total requests sent: ${totalRequestCount}`)
      this.logger?.(`# total successful requests: ${this.externalSuccessfulRequestCount}`)
      if (
        // only care out external, since 
        // `this.totalSuccessfulRequestCount` is the items in the current queue.
        // it may be the case that the external requests have already achieved `maxRequestCount` items,
        // which means there is no point of continuing already 
        this.externalSuccessfulRequestCount >= this.maxRequestCount 
      ) {
        this.terminate()
      }
      if (
        !(this.currentRequestCount === 0 && this.queue.length === 0) &&
        this.currentRequestCount < this.maxConcurrentRequest
      ) {
        while (this.currentRequestCount < this.maxConcurrentRequest) {
          if (this.externalSuccessfulRequestCount >= this.maxRequestCount) {
            this.queue = []
            this.currentRequestCount = 0
            this.hasNoMoreRequestEnqueued = true
            break
          }
          ++totalRequestCount

          timeoutIds.forEach((id) => clearTimeout(id))
          timeoutIds = []
          this.sendRequest()
            .catch((err: Err) => {
              this.responses.push(err)
            })
            .then((res) => {
              if (res) this.responses.push(res)
            })
            .finally(() => {
              ++this.totalSuccessfulRequestCount
              --this.currentRequestCount
              // if it is clear that no more requests will be enqueued,
              // check if the function can end right away
              if (this.hasNoMoreRequestEnqueued) {
                this.terminateIfPossible()
              }
              timeoutIds.push(
                setTimeout(() => {
                  // if things seem to be completed, check again after 1 second,
                  // and if it is empty, that means new request has not been sent anymore
                  // which means every request has been sent and there's no more work to do
                  this.terminateIfPossible()
                }, this.lastRequestTimeoutMs)
              )
            })
          ++this.currentRequestCount
        }
      }
    }
    run()
    this.intervalId = setInterval(run, 10)
  }

  private async sendRequest(): Promise<null | Res | Err> {
    const req = this.queue.shift()

    if (req === undefined) {
      return null
    }
    const [err, res] = await to<Res, Err>(req())

    if (res === undefined || err !== null) {
      return err
    }

    return res
  }

  /**
   * Let RequestQueue know that there is going to be no more
   * request input from the user.
   *
   * This is important because RequestQueue will be able to quit
   * immediately after the last request completes knowing that
   * no more requests will be enqueued.
   */
  public setNoMoreRequestEnqueued() {
    this.hasNoMoreRequestEnqueued = true
  }

  /**
   * User only has to enqueue his request here and RequestQueue will take
   * care of the rest.
   * @param retriveBlockRequestFn
   * any function that returns a promise (i.e. sends an async request)
   */
  public enqueue(retriveBlockRequestFn: () => Promise<Res>) {
    if (this.hasNoMoreRequestEnqueued) return
    this.queue.push(retriveBlockRequestFn)
  }

  /**
   * @param listener any callback to be called when RequestQueue finishes its work
   * and meaning that the queue is empty
   */
  public onComplete<Fn extends (...args: any[]) => void>(listener: Fn) {
    this.eventEmitter.on(`complete`, listener)

    this.queue = []
    this.responses = []
  }

  public incrementExternalRequestMatchCount(increaseBy = 1) {
    if (increaseBy <= 0) return
    this.externalSuccessfulRequestCount += increaseBy
  }
}
