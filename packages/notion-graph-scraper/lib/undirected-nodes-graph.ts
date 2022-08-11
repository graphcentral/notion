import { NotionContentNode } from "../types/notion-content-node"
import { DeepReadonly } from "../types/util-types"

/**
 * represents the graph of nodes.
 *
 * example:
 * ```
 * {
 *  [node_id0]: {
 *    [node_id1]: true,
 *    [node_id2]: true,
 *  },
 *  [node_id1]: {
 *    [node_id3]: true
 *  }
 * }
 * ```
 * this means node_id0 is connected with node_id1 and node_id2, and
 * node_id1 with node_id3. This is an undirected graph; Therfore, there
 * must not be any duplicate edge in this data structure.
 *
 * For example,
 * ```
 * {
 *  [node_id0]: {
 *    [node_id1]: true,
 *    [node_id2]: true,
 *  },
 *  [node_id1]: {
 *    [node_id0]: true
 *  }
 * }
 * ```
 * Such a graph must not be made because edge(node_id1, node_id0) exists twice.
 *
 * This kind of data structure is used in an effort to efficiently create the graph
 */
export type RawUndirectedNodesGraph = Record<
  NotionContentNode[`id`],
  Record<NotionContentNode[`id`], boolean> | undefined
>

/**
 * d3.js uses `source: ... target: ...` format to abstract
 * the concept of an edge.
 */
interface D3JsEdge {
  source: NotionContentNode[`id`]
  target: NotionContentNode[`id`]
}

/**
 * Represents an undirected graph of nodes.
 */
export class UndirectedNodesGraph<
  Node extends { id: NotionContentNode[`id`] }
> {
  private graph: RawUndirectedNodesGraph = {}
  private nodesLength = 0

  /**
   * Adds an edge between two nodes, but avoids making duplicates
   * if the edge already exists
   *
   * Existence of an edge at a time cannot guarantee the existence
   * of a vertex stored in another data structure (it depends on your implementation)
   */
  public addEdgeByIds(node0id: string, node1id: string) {
    // node0 may already have node1, but we just update it anyway
    let node0Edges = this.graph[node0id]
    const node1Edges = this.graph[node1id]
    // check if edge already exists in node1Edges
    if (node1Edges && node1Edges[node0id]) {
      // if edge already exists, return
      return
    }
    // otherwise, add a new edge to node0
    if (!node0Edges) node0Edges = {}
    node0Edges[node1id] = true

    this.graph[node0id] = node0Edges
    this.nodesLength += 1
  }
  /**
   * Adds an edge between two nodes, but avoids making duplicates
   * if the edge already exists
   *
   * usually, `target` will be stored as parent of a node
   * `source` will be the child node
   */
  public addEdge(node0: Node, node1: Node): void {
    this.addEdgeByIds(node0.id, node1.id)
  }

  public getGraph(): DeepReadonly<RawUndirectedNodesGraph> {
    return this.graph
  }

  /**
   * transform `this.graph` to d3.js edge (link) shape.
   * The output will be used directly in frontend.
   *
   */
  public getD3JsEdgeFormat(): DeepReadonly<D3JsEdge[]> {
    const d3JsEdges: D3JsEdge[] = []
    Object.keys(this.graph).map((nodeId) => {
      const edges = this.graph[nodeId]
      if (!edges) return
      for (const edge of Object.keys(edges)) {
        d3JsEdges.push({
          source: nodeId,
          target: edge,
        })
      }
    })

    return d3JsEdges
  }

  public get length(): number {
    return this.length
  }
}
