import { NotionGraph } from "./lib/lib"
import fs from "fs"
/**
 * example of how to use `@graphcentral/notion-graph-scraper`
 */
;(async () => {
  const notionGraph = new NotionGraph({
    maxDiscoverableNodes: 300,
    maxDiscoverableNodesInOtherSpaces: 300,
    verbose: true,
  })
  const graph = await notionGraph.buildGraphFromRootNode(
    `e040febf70a94950b8620e6f00005004`
  )
  console.log(graph.nodes.length)
  console.log(graph.links.length)
  await new Promise((resolve, reject) => {
    fs.writeFile(`test0.json`, JSON.stringify(graph), (err) => {
      if (err) reject(err)
      else resolve(``)
    })
  });

  process.exit(0)
})()
