import { NotionGraph } from "@graphcentral/notion-graph-scraper";
import serverless from "serverless-http";
import to from "await-to-js";
import express from "express";
import { mongoClient } from "../../model";

async () => {
  const [mongoClientConnectErr] = await to(mongoClient.connect());
  if (mongoClientConnectErr) {
  }
};
const createGraph = async () => {
  const notionGraph = new NotionGraph({
    maxDiscoverableNodes: 200,
    maxDiscoverableNodesInOtherSpaces: 200,
    verbose: false,
    maxConcurrentRequest: 80,
  });
  return notionGraph.buildGraphFromRootNode(
    // notion help page
    `e040febf70a94950b8620e6f00005004`
  );
};

const app = express();
app.use(express.json());

app.post(`/graphs`, async (req, res, next) => {
  console.log(req.body);
  const [maybeGraphInitResultErr, maybeGraphInitResult] = await to(
    createGraph()
  );
  if (maybeGraphInitResultErr || !maybeGraphInitResult) {
    return res.status(500).json({ message: `failed to create graph` });
  }
  const [maybeGraphsCollectionErr, maybeGraphsCollection] = await to(
    mongoClient.db(`notion-graph`).createCollection(`graphs`)
  );
  if (maybeGraphsCollectionErr || !maybeGraphsCollection) {
    return res.status(500).json({ message: `failed to create collection` });
  }
  // const [maybe, maybe2] = await to(
  // maybeGraphsCollection.insertOne({ _id: })
  // );

  return res.status(200).json(maybeGraphInitResult);
});

app.get(`/graphs/:id`, async (req, res, next) => {
  return res.status(200).json({});
});

module.exports.graphs = serverless(app);
