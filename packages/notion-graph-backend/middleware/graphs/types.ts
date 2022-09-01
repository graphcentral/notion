import { RequestHandler } from "express";
import { NotionGraphInfo } from "./validators";

export type PostGraphsLocals = {
  jsonBody?: NotionGraphInfo;
  notionPageId?: string;
};

export type PostGraphsMiddleare = RequestHandler<
  any,
  any,
  any,
  any,
  PostGraphsLocals
>;

export type GetGraphsLocals = {
  notionPageId?: string;
};

export type GetGraphsMiddleare = RequestHandler<
  any,
  any,
  any,
  any,
  GetGraphsLocals
>;
