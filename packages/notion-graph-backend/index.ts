import { NotionGraph } from "@graphcentral/notion-graph-scraper";
import fs from "fs";
import Pusher from "pusher";
import * as dotenv from "dotenv";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, `..`, `..`, `.env`) });

const pusher = new Pusher({
  appId: String(process.env.pusher_app_id),
  key: String(process.env.pusher_key),
  secret: String(process.env.pusher_secret),
  cluster: String(process.env.pusher_cluster),
  useTLS: true,
});

pusher.trigger(`my-channel`, `my-event`, {
  message: `hello world`,
});

const run = async () => {
  const notionGraph = new NotionGraph({
    maxDiscoverableNodes: 2000,
    maxDiscoverableNodesInOtherSpaces: 2000,
    verbose: true,
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
