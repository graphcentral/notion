import { NotionAPI } from "notion-client";
import { Errors } from "../errors";
import { toEnhanced } from "./global-util";
import { RequestQueue } from "./request-queue";
import { separateIdWithDashSafe } from "./isomorphic-notion-util";
import { Block, BlockMap } from "../types/block-map";
import { UndirectedNodesGraph } from "./undirected-nodes-graph";
import {
  isNotionContentNodeType,
  NotionContentNodeUnofficialAPI,
} from "../types/notion-content-node";
import { UnofficialNotionAPIUtil } from "./unofficial-notion-api-util";
import { createLogger } from "./logger";

/**
 * Graph of notion blocks.
 *
 * Does a lot of async calls,
 * so it's possible that async error occurs anywhere.
 *
 * The key to handling the error is how we approach the UX in the frontend
 * regarding the error. What will we do for the user when we encounter an error?
 *
 * - Case 1: Some of the blocks are missing, but it's still viewable by the user. Then still include the errors and error messages from the server, but show the contents
 * - Case 2: All blocks are missing (ex. internet not working for some reason from the server). Then send a complete error, possibly with a helpful if message if any
 */
export class NotionGraph {
  private unofficialNotionAPI: NotionAPI;
  private errors: Error[] = [];
  private nodes: Record<
    NotionContentNodeUnofficialAPI[`id`],
    NotionContentNodeUnofficialAPI
  > = {};
  /**
   * total number of discovered, unique nodes
   */
  private nodesLength = 0;
  /**
   * total number of discovered, unique nodes in other spaces (= Notion workspace).
   */
  private otherSpacesNodesLength = 0;
  /**
   * represents a graph of nodes.
   * contains info about how nodes are connected by edges
   */
  private nodesGraph =
    new UndirectedNodesGraph<NotionContentNodeUnofficialAPI>();
  /**
   * @see NotionGraph['constructor']
   */
  private maxDiscoverableNodes: number;
  /**
   * @see NotionGraph['constructor']
   */
  private maxDiscoverableNodesInOtherSpaces: number;
  /**
   * @see NotionGraph['constructor']
   */
  private maxConcurrentRequest: number;
  private lastRequestTimeoutMs: number;
  private verbose = true;
  private logger: ReturnType<typeof createLogger>;

  constructor({
    unofficialNotionAPI = new NotionAPI(),
    maxDiscoverableNodes = 500,
    maxDiscoverableNodesInOtherSpaces = 250,
    maxConcurrentRequest = 35,
    lastRequestTimeoutMs = 15_000,
    verbose = true,
  }: {
    /**
     * If you want to use your `NotionAPI` instance, you can do it yourself
     * ```ts
     * import { NotionAPI } from "notion-client"
     *
     * const notionUnofficialClient = new NotionAPI({ ...customConfig })
     * const ng = new NotionGraph({ unofficialNotionAPI: notionUnofficialClient, ... })
     * ```
     *
     * Otherwise, leave this field as undefined. This means that
     * you are only going to be able to request public pages on Notion.
     */
    unofficialNotionAPI?: NotionAPI;
    /**
     * user-defined value of maximum discoverable number of unique nodes.
     * must stop discovery once the program finds nodes over
     * the discoverable number of unique nodes set by the user.
     *
     * this is useful when your notion workspace
     * (or 'space' as it is from the actual notion API)
     * has lots of pages and you want to stop before the amount of pages you accumulate
     * becomes too many.
     *
     * setting it to null means infinity, but it's never
     * recommended because you can't guarantee how long it will take to discover
     * all nodes. Make sure you know what you are doing if you set it to `null`.
     *
     * @throws when this is smaller than maxDiscoverableNodes, which is impossible to happen
     * @default 500 nodes.
     */
    maxDiscoverableNodes?: number | null;
    /**
     * This parameter is only needed due to the existence of backlinks
     * (= 'link to page' function on Notion).
     *
     * If your page happens to have lots of backlinks to OTHER `space`s (= workspaces) out of your
     * current space, then you would need to decide if you will try to discover
     * the nodes from those spaces as well.
     *
     * Otherwise, in the worst case, the program may not halt because
     * a chain of Notion nodes that include many backlinks to other workspaces
     * will probably take hours or days to crawl all of the nodes.
     *
     * if you don't need pages or databases outside your workspace,
     * simply set this to 0.
     *
     * @throws when this is bigger than maxDiscoverableNodes, which is impossible to happen
     * @default 250 nodes
     */
    maxDiscoverableNodesInOtherSpaces?: number;
    /**
     * # network requests to be sent the same time.
     * if too big it might end up causing some delay
     * @default 35
     */
    maxConcurrentRequest?: number;
    /**
     *
     * @deprecated
     * will be removed later.
     * there is a better way to handle the last request without this.
     *
     * If `maxDiscoverableNodes` is bigger than the total pages discovered
     * and there are no more request in the duration of `lastRequestTimeoutMs`,
     * the program exits by then
     */
    lastRequestTimeoutMs?: number;
    /**
     * If set as true, will output progress as it scrapes pages
     */
    verbose?: boolean;
  }) {
    if (
      maxDiscoverableNodes !== null &&
      maxDiscoverableNodes < maxDiscoverableNodesInOtherSpaces
    ) {
      throw new Error(
        Errors.NKG_0006(maxDiscoverableNodes, maxDiscoverableNodesInOtherSpaces)
      );
    }
    this.unofficialNotionAPI = unofficialNotionAPI;
    this.maxDiscoverableNodes = maxDiscoverableNodes ?? Infinity;
    this.maxConcurrentRequest = maxConcurrentRequest;
    this.maxDiscoverableNodesInOtherSpaces = maxDiscoverableNodesInOtherSpaces;
    this.lastRequestTimeoutMs = lastRequestTimeoutMs;
    this.verbose = verbose;
    this.logger = createLogger(verbose);
  }

  private accumulateError(err: Error) {
    this.errors.push(err);
  }

  /**
   * Finds the topmost block from any block id.
   * Notion API is structured in a way that any call to a getPage
   * would return its recursive parents in its response.
   * The last recursive parent will be the topmost block.
   * @param blockIdWithoutDash
   * @returns `null` if an error happens or nothing is found
   * @throws nothing
   */
  private async findTopmostBlock(
    blockIdWithoutDash: string
  ): Promise<null | BlockMap[keyof BlockMap]> {
    const [err, page] = await toEnhanced(
      this.unofficialNotionAPI.getPage(blockIdWithoutDash)
    );

    if (err || !page) {
      if (err) {
        this.errors.push(err);
        this.errors.push(new Error(Errors.NKG_0000(blockIdWithoutDash)));
      }
      return null;
    }

    const topmostBlock = Object.values(page.block).find(
      (b) =>
        // the block itself or the block that has parent as a 'space'
        b.value.id === separateIdWithDashSafe(blockIdWithoutDash) ||
        UnofficialNotionAPIUtil.isBlockToplevelPageOrCollectionViewPage(b)
    );

    if (!topmostBlock) {
      this.errors.push(new Error(Errors.NKG_0000(blockIdWithoutDash)));
      return null;
    }

    return topmostBlock;
  }

  private addDiscoveredNode({
    childNode,
    parentNode,
    requestQueue,
    rootBlockSpaceId,
  }: {
    childNode: NotionContentNodeUnofficialAPI;
    parentNode: NotionContentNodeUnofficialAPI;
    requestQueue: RequestQueue<any, Error>;
    rootBlockSpaceId: string | undefined;
  }) {
    if (!(childNode.id in this.nodes)) {
      this.nodesLength += 1;
    }

    this.nodes[childNode.id] = childNode;
    this.nodesGraph.addEdge(childNode, parentNode);
    if (parentNode.cc) parentNode.cc += 1;
    else parentNode.cc = 1;
    requestQueue.incrementExternalRequestMatchCount();
    requestQueue.enqueue(() =>
      this.recursivelyDiscoverBlocks({
        rootBlockSpaceId,
        requestQueue,
        // now childnode will become a parent of other nodes
        parentNode: childNode,
      })
    );
  }

  /**
   * Notion API has a weird structure
   * where you can't get the database(=collection)'s title at once if it is a child of a page in the response.
   * You need to request the database as a parent directly again.
   * This function just uses the second response to update the database's title
   * @param page
   * @param parentNode
   * @returns nothing
   */
  private addCollectionViewTitleInNextRecursiveCall(
    page: Awaited<ReturnType<NotionAPI[`getPage`]>>,
    parentNode: NotionContentNodeUnofficialAPI
  ): void {
    if (
      parentNode.type !== `collection_view` &&
      parentNode.type !== `collection_view_page`
    )
      return;

    const blocks = page.block;
    const collection = page.collection;
    // this contains the id of the 'collection' (not 'collection_view')
    // 'collection' contains the name of the database, which is what we want
    const collectionViewBlock = blocks[parentNode.id];
    // use this to get the collection (database) title
    const collectionId: string | undefined =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      collectionViewBlock.value.collection_id;
    // extra careful output typing
    if (!collection)
      this.accumulateError(new Error(Errors.NKG_0003(`collection`)));
    if (!collectionId)
      this.accumulateError(new Error(Errors.NKG_0003(`collectionId`)));
    if (!collectionViewBlock)
      this.accumulateError(new Error(Errors.NKG_0003(`collectionViewBlock`)));
    if (collectionId && collection && !(collectionId in collection)) {
      this.accumulateError(new Error(Errors.NKG_0004(collectionId)));
    }

    if (
      collection &&
      collectionId &&
      collectionViewBlock &&
      collectionId in collection
    ) {
      // {
      //  ...
      //  "collection": {
      //   "58e7440f-fad4-4a30-9de3-2dc5f5673b62": {
      //     "role": "reader",
      //     "value": {
      //       "id": "58e7440f-fad4-4a30-9de3-2dc5f5673b62",
      //       "version": 14,
      //       "name": [
      //         [
      //           "Database-test"
      //         ]
      //       ],
      // @ts-ignore: wrong library typing
      const collectionBlock: Block = collection[collectionId];
      const title =
        UnofficialNotionAPIUtil.getTitleFromCollectionBlock(collectionBlock);
      // just being extra careful
      if (parentNode.id in this.nodes) {
        this.nodes[parentNode.id].title = title;
      }
    }
  }

  /**
   * Recursively discovers notion blocks (= nodes).
   *
   * All block types we care about is `NotionContentNodeUnofficialAPI['type']`.
   * Check it out.
   */
  public async recursivelyDiscoverBlocks({
    rootBlockSpaceId,
    parentNode,
    requestQueue,
  }: {
    rootBlockSpaceId: string | undefined;
    parentNode: NotionContentNodeUnofficialAPI;
    requestQueue: RequestQueue<any, Error>;
  }): Promise<void> {
    const [err, page] = await toEnhanced(
      // getPageRaw must NOT be used
      // as it returns insufficient information
      this.unofficialNotionAPI.getPage(parentNode.id)
    );
    if (err) this.accumulateError(err);
    if (!page) return;
    // if the parent node was collection_view,
    // the response must contain `collection` and `collection_view` keys
    if (
      parentNode.type === `collection_view` ||
      parentNode.type === `collection_view_page`
    ) {
      this.addCollectionViewTitleInNextRecursiveCall(page, parentNode);
    }

    for (const selfOrChildBlockId of Object.keys(page.block)) {
      // if the number of discovered nodes is more
      // than we want
      if (
        this.maxDiscoverableNodes &&
        this.nodesLength > this.maxDiscoverableNodes
      ) {
        requestQueue.setNoMoreRequestEnqueued();
        return;
      }
      const childBlock = page.block[selfOrChildBlockId];

      // somtimes .value is undefined for some reason
      if (!childBlock || !childBlock.value) {
        continue;
      }

      const childBlockType = page.block[selfOrChildBlockId].value.type;
      const spaceId = page.block[selfOrChildBlockId].value.space_id;
      /**
       * Ignore unwanted content type
       */
      if (!isNotionContentNodeType(childBlockType)) continue;
      /**
       * Ignore the block itself returned inside the response
       * or the block that has already been discovered
       */
      if (
        selfOrChildBlockId === separateIdWithDashSafe(parentNode.id) ||
        selfOrChildBlockId in this.nodes
      ) {
        continue;
      }
      /**
       * If spaceId is undefined, we can't proceed anyway
       * not sure if this typing from the sdk is correct
       * it seems that spaceId is always defined for
       * the node types we use though (`NotionContentNodeUnofficialAPI['type']`)
       */
      if (!spaceId) {
        continue;
      }

      if (childBlockType !== `alias` && spaceId !== rootBlockSpaceId) {
        /**
         * If there are too many nodes (except 'alias' because it's not technically a page) discovered from
         * other spaces, ignore them
         */
        if (
          this.otherSpacesNodesLength > this.maxDiscoverableNodesInOtherSpaces
        ) {
          continue;
        }
        this.otherSpacesNodesLength += 1;
      }

      const childBlockId = selfOrChildBlockId;
      switch (childBlockType) {
        // for alias, don't add another block
        // just add edges between the pages
        case `alias`: {
          const aliasedBlockId = childBlock.value?.format?.alias_pointer?.id;
          const aliasedBlockSpaceId =
            childBlock.value?.format?.alias_pointer?.spaceId;
          if (aliasedBlockId) {
            this.nodesGraph.addEdgeByIds(parentNode.id, aliasedBlockId);
            // if aliased block id is in another space,
            // need to request that block separately
            // because it is not going to be discovered
            if (aliasedBlockSpaceId !== rootBlockSpaceId) {
              // @todo
            }
          } else {
            this.errors.push(new Error(Errors.NKG_0005(childBlock)));
          }
          break;
        }
        case `collection_view`: {
          const childNode: NotionContentNodeUnofficialAPI = {
            // title will be known in the next request
            title: `Unknown database title`,
            id: childBlockId,
            spaceId,
            parentId: parentNode.id,
            type: childBlockType,
          };
          this.addDiscoveredNode({
            childNode,
            parentNode,
            requestQueue,
            rootBlockSpaceId,
          });
          break;
        }
        case `collection_view_page`: {
          const childNode: NotionContentNodeUnofficialAPI = {
            // title will be known in the next request
            title: `Unknown database page title`,
            id: childBlockId,
            collection_id:
              // @ts-ignore
              childBlock.value.collection_id,
            parentId: parentNode.id,
            spaceId,
            type: childBlockType,
          };
          this.addDiscoveredNode({
            childNode,
            parentNode,
            requestQueue,
            rootBlockSpaceId,
          });
          break;
        }
        case `page`: {
          const title =
            UnofficialNotionAPIUtil.getTitleFromPageBlock(childBlock);
          const spaceId = childBlock.value.space_id ?? `Unknown space id`;
          const typeSafeChildNode = {
            id: childBlockId,
            parentId: parentNode.id,
            spaceId,
            type: childBlockType,
            title,
          };
          this.addDiscoveredNode({
            childNode: typeSafeChildNode,
            parentNode,
            requestQueue,
            rootBlockSpaceId,
          });
          break;
        }
      }
    }
  }

  /**
   * Builds a graph from a node (also called a page or block in Notion)
   *
   * You can easily find the page's block id from the URL.
   * The sequence of last 32 characters in the URL is the block id.
   * For example:
   *
   * https://my.notion.site/My-Page-Title-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   *
   * `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` is the block id.
   * @param rootBlockId the block id of the page, favorably the root page in your workspace
   * so that as many pages as possible will be discovered.
   * @returns graph information relevant to frontend's graph visualization
   */
  public async buildGraphFromRootNode(rootBlockId: string): Promise<{
    nodes: NotionContentNodeUnofficialAPI[];
    links: ReturnType<
      UndirectedNodesGraph<NotionContentNodeUnofficialAPI>[`getD3JsEdgeFormat`]
    >;
    errors: Error[];
  }> {
    const defaultReturn = {
      links: [],
      nodes: Object.values(this.nodes),
      errors: this.errors,
    };
    const requestQueue = new RequestQueue<any, Error>({
      maxRequestCount: this.maxDiscoverableNodes,
      maxConcurrentRequest: this.maxConcurrentRequest,
      lastRequestTimeoutMs: this.lastRequestTimeoutMs,
      logger: this.logger,
    });

    const topMostBlock = await this.findTopmostBlock(rootBlockId);

    if (!topMostBlock) {
      return defaultReturn;
    }

    const typeSafeRootBlockNode =
      UnofficialNotionAPIUtil.extractTypeUnsafeNotionContentNodeFromBlock(
        topMostBlock
      );

    const rootBlockSpaceId = topMostBlock.value.space_id;
    if (!typeSafeRootBlockNode) {
      this.errors.push(new Error(Errors.NKG_0001(topMostBlock)));
      return defaultReturn;
    }

    this.nodes[typeSafeRootBlockNode.id] = typeSafeRootBlockNode;
    await toEnhanced(
      Promise.allSettled([
        this.recursivelyDiscoverBlocks({
          // @ts-ignore: todo fix this (the topmost block can be a collection_view_page)
          parentNode: typeSafeRootBlockNode,
          rootBlockSpaceId,
          requestQueue,
        }),
        new Promise((resolve) => requestQueue.onComplete(resolve)),
      ])
    );

    // edges may contain undiscovered nodes
    // so remove them
    const links = this.nodesGraph
      .getD3JsEdgeFormat()
      .filter(
        ({ source, target }) => source in this.nodes && target in this.nodes
      );

    return {
      nodes: Object.values(this.nodes),
      links,
      errors: this.errors,
    };
  }
}
