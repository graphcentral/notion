import { NotionGraph } from "@graphcentral/notion-graph-scraper";
import { model, Schema, Types } from "mongoose";

interface Graph {
  // supposed to be notion page id
  _id: string;
  links: Awaited<ReturnType<NotionGraph[`buildGraphFromRootNode`]>>[`links`];
  nodes: Awaited<ReturnType<NotionGraph[`buildGraphFromRootNode`]>>[`nodes`];
}

export const graphSchema = new Schema<Graph>(
  {
    _id: { type: String, required: true },
    links: [
      {
        source: {
          type: String,
          required: true,
        },
        target: {
          type: String,
          required: true,
        },
      },
    ],
    nodes: [
      {
        title: {
          type: String,
          required: true,
        },
        id: {
          type: String,
          required: true,
        },
        spaceId: {
          type: String,
          required: true,
        },
        parentId: {
          type: String,
          required: true,
        },
        cc: {
          type: Number,
        },
        type: {
          type: String,
          required: true,
        },
        collection_id: {
          type: String,
        },
        x: {
          type: Number,
        },
        y: {
          type: Number,
        },
      },
    ],
  },
  { _id: false, timestamps: true }
);

export const GraphModel = model(`graph`, graphSchema);
