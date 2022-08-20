import { FC, memo } from "react"
import { withErrorBoundary } from "../components/Util/WithErrorBoundary"
import flow from "lodash.flow"

export const enhance: <Props>(
  Component: FC<Props>
) => (
  Fallback?: FC
) => React.MemoExoticComponent<({ ...props }: Props) => JSX.Element> = flow(
  memo,
  withErrorBoundary
)

export type TcResult<Data, Throws = Error> = [null, Data] | [Throws]

export async function tcAsync<T, Throws = Error>(
  promise: Promise<T>
): Promise<TcResult<T, Throws>> {
  try {
    const response: T = await promise

    return [null, response]
  } catch (error) {
    return [error] as [Throws]
  }
}

export function tcSync<
  ArrType,
  Params extends Array<ArrType>,
  Returns,
  Throws = Error
>(
  fn: (...params: Params) => Returns,
  ...deps: Params
): TcResult<Returns, Throws> {
  try {
    const data: Returns = fn(...deps)

    return [null, data]
  } catch (e) {
    return [e] as [Throws]
  }
}
