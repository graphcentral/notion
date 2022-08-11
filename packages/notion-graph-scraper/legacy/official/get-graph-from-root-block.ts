/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Client } from "@notionhq/client"
import {
  ListBlockChildrenResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints"
import to from "await-to-js"
import { RequestQueue } from "../../lib/request-queue"
import { UndirectedNodesGraph } from "../../lib/undirected-nodes-graph"
import { NotionContentNode } from "../../types/notion-content-node"
import {
  separateIdWithDashSafe,
  identifyObjectTitle,
} from "../../lib/isomorphic-notion-util"

function blockTypeToNotionContentNodeType(
  blockType: `child_page` | `child_database`
) {
  switch (blockType) {
    case `child_database`:
      return `database`
    case `child_page`:
      return `page`
    default:
      return `error`
  }
}

/**
 *
 * @param notion notion client
 * @param rootBlockId the id of a root page or database
 * @returns `null` on error. Otherwise `database` or `page`
 */
async function retrieveRootNode(
  notion: Client,
  rootBlockId: NotionContentNode[`id`]
): Promise<NotionContentNode | null> {
  const [err, blockInfo] = await to(
    notion.blocks.retrieve({
      block_id: separateIdWithDashSafe(rootBlockId),
    })
  )

  if (err || !blockInfo) {
    return null
  }

  return {
    type: blockTypeToNotionContentNodeType(
      // @ts-ignore: sdk bad typing
      blockInfo.type
    ),
    id: separateIdWithDashSafe(rootBlockId),
    title: identifyObjectTitle(blockInfo),
  }
}

/**
 *
 * @param notion
 * @param parentNode
 * @returns `null` on error, otherwise databaseChildren OR pageChildren
 */
async function retrieveDatabaseOrPageChildren(
  notion: Client,
  parentNode: NotionContentNode
): Promise<{
  databaseChildren: QueryDatabaseResponse | null
  pageChildren: ListBlockChildrenResponse | null
} | null> {
  let pageChildren: Awaited<
    ReturnType<typeof notion[`blocks`][`children`][`list`]>
  > | null = null
  let databaseChildren: Awaited<
    ReturnType<typeof notion[`databases`][`query`]>
  > | null = null
  switch (parentNode.type) {
    case `database`: {
      const [err, databaseChildrenQueryResult] = await to(
        notion.databases.query({
          database_id: separateIdWithDashSafe(parentNode.id),
          page_size: 50,
        })
      )
      if (databaseChildrenQueryResult) {
        databaseChildren = databaseChildrenQueryResult
      }
      // if (err) console.log(err)
      break
    }
    case `page`: {
      const [err, pageChildrenListResult] = await to(
        notion.blocks.children.list({
          block_id: separateIdWithDashSafe(parentNode.id),
          page_size: 50,
        })
      )
      if (pageChildrenListResult) {
        pageChildren = pageChildrenListResult
      }
      // if (err) console.log(err)
    }
  }

  // something went wrong
  if (!databaseChildren && !pageChildren) {
    return null
  }

  return {
    databaseChildren,
    pageChildren,
  }
}

function createNotionContentNodeFromPageChild(
  pageChild: ListBlockChildrenResponse[`results`][0]
): NotionContentNode {
  return {
    title: identifyObjectTitle(pageChild),
    id: pageChild.id,
    // @ts-ignore: sdk doesn't support good typing
    type: blockTypeToNotionContentNodeType(
      // @ts-ignore: sdk doesn't support good typing
      pageChild.type
    ),
  }
}

function createNotionContentNodeFromDatabaseChild(
  databaseChild: QueryDatabaseResponse[`results`][0]
): NotionContentNode {
  return {
    title: identifyObjectTitle(databaseChild),
    id: databaseChild.id,
    type: databaseChild.object,
  }
}

/**
 * Notion API currently does not support getting all children of a page at once
 * so the only way is to recursively extract all pages and databases from the root block (page or database)
 * @param notion Notion client
 * @param rootBlockId the id of the root page or database.
 * Either format of 1429989fe8ac4effbc8f57f56486db54 or
 * 1429989f-e8ac-4eff-bc8f-57f56486db54 are all fine.
 * @returns all recurisvely discovered children of the root page
 */
export async function buildGraphFromRootNode(
  notion: Client,
  rootBlockId: string
): Promise<{
  nodes: NotionContentNode[]
  links: ReturnType<
    UndirectedNodesGraph<NotionContentNode>[`getD3JsEdgeFormat`]
  >
}> {
  const rootNode = await retrieveRootNode(notion, rootBlockId)

  if (!rootNode) {
    throw new Error(`Error while retrieving rootNode`)
  }
  const nodes: NotionContentNode[] = [rootNode]
  const nodesGraph = new UndirectedNodesGraph<NotionContentNode>()
  const requestQueue = new RequestQueue({ maxConcurrentRequest: 50 })

  async function retrieveNodesRecursively(parentNode: NotionContentNode) {
    const queryChild = (child: NotionContentNode) => {
      requestQueue.enqueue(() => retrieveNodesRecursively(child))
    }
    const processNewBlock = (newBlock: NotionContentNode) => {
      nodesGraph.addEdge(parentNode, newBlock)
      nodes.push(newBlock)
      queryChild(newBlock)
    }

    const databaseOrPageChildren = await retrieveDatabaseOrPageChildren(
      notion,
      parentNode
    )

    if (!databaseOrPageChildren) {
      return
    }

    const { pageChildren, databaseChildren } = databaseOrPageChildren

    if (pageChildren) {
      for (const child of pageChildren.results) {
        try {
          // @ts-ignore: sdk doesn't support good typing
          if (child.type === `child_database` || child.type === `child_page`) {
            const newBlock = createNotionContentNodeFromPageChild(child)
            processNewBlock(newBlock)
          }
        } catch (e) {
          // console.log(e)
          console.log(`e`)
        }
      }
    } else if (databaseChildren) {
      for (const child of databaseChildren.results) {
        try {
          const newBlock = createNotionContentNodeFromDatabaseChild(child)
          processNewBlock(newBlock)
        } catch (e) {
          // console.log(e)
          console.log(`e`)
        }
      }
    }
  }

  const [err] = await to(
    Promise.allSettled([
      retrieveNodesRecursively(rootNode),
      new Promise((resolve) => {
        requestQueue.onComplete(resolve)
      }),
    ])
  )

  if (err) {
    throw err
  }

  return {
    nodes,
    links: nodesGraph.getD3JsEdgeFormat(),
  }
}
