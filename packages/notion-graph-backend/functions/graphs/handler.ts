import { NotionGraph } from "@graphcentral/notion-graph-scraper";
import serverless from "serverless-http";
import to from "await-to-js";
import express, { Response } from "express";
import { waitUntilMongoClientConnected } from "../../model";
import {
  validateGetGraphQuery,
  validateNotionGraphInfo,
} from "../../middleware/graphs/validators";
import { transformNotionPageUrlToId } from "../../middleware/graphs/transformer";
import {
  GetGraphsLocals,
  PostGraphsLocals,
} from "../../middleware/graphs/types";
import { GraphModel } from "../../model/graph";

const app = express();
app.use(express.json());

[validateNotionGraphInfo, transformNotionPageUrlToId].forEach((middleware) => {
  app.post(`/graphs`, middleware);
});
app.post(`/graphs`, async (req, res: Response<any, PostGraphsLocals>, next) => {
  const { notionPageId } = res.locals;
  if (!notionPageId) {
    return res
      .status(500)
      .json({ message: `notionPageId is undefined or null` });
  }
  const notionGraph = new NotionGraph({
    maxDiscoverableNodes: 500,
    maxDiscoverableNodesInOtherSpaces: 500,
    verbose: true,
    maxConcurrentRequest: 80,
  });
  const [maybeGraphBuildErr, maybeGraphBuildResult] = await to(
    notionGraph.buildGraphFromRootNode(notionPageId)
  );
  if (maybeGraphBuildErr || !maybeGraphBuildResult) {
    return res.status(500).json({ message: `failed to create graph` });
  }
  const [mongoConnectErr] = await to(waitUntilMongoClientConnected());
  if (mongoConnectErr) {
    return res.status(500).json({ message: `failed to connect to db` });
  }
  const { nodes, links } = maybeGraphBuildResult;
  const graph = new GraphModel({
    _id: notionPageId,
    nodes,
    links,
  });
  const [insertGraphErr] = await to(graph.save());

  if (insertGraphErr) {
    return res.status(500).json({
      message: `failed to insert graph into collection`,
      error: JSON.stringify(insertGraphErr),
    });
  }

  return res.status(200).json(maybeGraphBuildResult);
});

[validateGetGraphQuery].forEach((middleware) => {
  app.get(`/graphs`, middleware);
});
app.get(`/graphs`, async (req, res: Response<any, GetGraphsLocals>, next) => {
  const { notionPageId } = res.locals;
  if (!notionPageId) {
    return res
      .status(500)
      .json({ message: `notionPageId is undefined or null` });
  }
  const [findGraphByIdErr, findGraphByIdResult] = await to(
    GraphModel.findById(notionPageId).exec()
  );
  if (findGraphByIdErr) {
    return res.status(500).json({
      message: `failed to find a graph`,
      error: JSON.stringify(findGraphByIdErr),
    });
  } else if (findGraphByIdResult === null) {
    return res
      .status(500)
      .json({ message: `graph exists, but nodes or links do not exist` });
  }

  return res.status(200).json(findGraphByIdResult);
});

module.exports.graphs = serverless(app);
