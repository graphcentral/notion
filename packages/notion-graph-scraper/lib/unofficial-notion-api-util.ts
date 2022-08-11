import { nameUntitledIfEmpty } from "./isomorphic-notion-util"
import { Block, BlockMap } from "../types/block-map"
import {
  isNotionContentNodeType,
  NotionContentNodeUnofficialAPI,
} from "../types/notion-content-node"

/**
 * Utils specific to unofficial notion api
 */
export class UnofficialNotionAPIUtil {
  /**
   * Be as conservative as possible because
   * Notion API may change any time
   * @param page
   * @returns
   */
  public static getTitleFromPageBlock(page: BlockMap[keyof BlockMap]): string {
    const { properties } = page.value

    // if a page is untitled, properties does not exist at all
    if (!properties) {
      return `Untitled`
    }

    const title = properties?.title?.[0]?.[0]

    if (title === undefined || title === null) {
      return `Untitled`
    }

    return nameUntitledIfEmpty(title)
  }

  public static getTitleFromCollectionBlock(collectionBlock: Block): string {
    const name: string | undefined =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      collectionBlock.value?.name?.[0]?.[0]

    if (name === undefined || name === null) {
      return `Unknown database title`
    }

    return name
  }
  /**
   * `parent_table` is space if the block is at the top level of all pages (= the block is
   * one of the pages we can click on from the left navigation panel on Notion app)
   * @param block any block (page, collection view page, ...)
   * @returns whether the block is a top level page or collection view page.
   */
  public static isBlockToplevelPageOrCollectionViewPage(
    block: BlockMap[keyof BlockMap]
  ): boolean {
    // parent_table can be undefined
    return block.value?.parent_table === `space`
  }

  /**
   * Gets a notion content node from a block.
   * But the type could be anything. It's not one of the four block types we want yet.
   * @deprecated don't use this except for finding the root block
   */
  public static extractTypeUnsafeNotionContentNodeFromBlock(
    block: BlockMap[keyof BlockMap]
  ): null | NotionContentNodeUnofficialAPI {
    const title = UnofficialNotionAPIUtil.getTitleFromPageBlock(block)
    const type = block.value.type
    const spaceId = block.value.space_id ?? `Unknown space id`

    if (!isNotionContentNodeType(type)) return null

    if (type === `collection_view_page`) {
      if (!block.value.collection_id) return null

      return {
        id: block.value.id,
        title,
        type,
        spaceId,
        parentId: `none`,
        collection_id: block.value.collection_id,
      }
    }

    return {
      id: block.value.id,
      title,
      type,
      spaceId,
      parentId: `none`,
    }
  }
}
