import type { WalkGraph } from '../types/game';

export function bfsReachable(graph: WalkGraph, startNodeId: string): Set<string> {
  const visited = new Set<string>();
  const queue: string[] = [startNodeId];

  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (!nodeId || visited.has(nodeId)) {
      continue;
    }

    visited.add(nodeId);

    for (const edge of graph.adjacency[nodeId] ?? []) {
      if (!visited.has(edge.to)) {
        queue.push(edge.to);
      }
    }
  }

  return visited;
}
