import { NotionGraph } from "@graphcentral/notion-graph-scraper";
import fs from "fs";
import Pusher from "pusher";
import { ENV } from "./env";

const pusher = new Pusher({
  appId: ENV.PUSHER_APP_ID,
  key: ENV.PUSHER_KEY,
  secret: ENV.PUSHER_SECRET,
  cluster: ENV.PUSHER_CLUSTER,
  useTLS: true,
});

pusher.trigger(`my-channel`, `my-event`, {
  message: `hello world`,
});

const run = async () => {
  const notionGraph = new NotionGraph({
    maxDiscoverableNodes: 2000,
    maxDiscoverableNodesInOtherSpaces: 2000,
    verbose: false,
    maxConcurrentRequest: 80,
  });
  const graph = await notionGraph.buildGraphFromRootNode(
    // notion help page
    `e040febf70a94950b8620e6f00005004`
  );
  console.log(graph.nodes.length);
  console.log(graph.links.length);
  await new Promise((resolve, reject) => {
    fs.writeFile(`test0.json`, JSON.stringify(graph), (err) => {
      if (err) reject(err);
      else resolve(``);
    });
  });

  process.exit(0);
};

run();
