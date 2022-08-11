import { NotionAPI } from "notion-client"

export type BlockMap = Awaited<ReturnType<NotionAPI[`getPage`]>>[`block`]

export type Block = BlockMap[keyof BlockMap]
