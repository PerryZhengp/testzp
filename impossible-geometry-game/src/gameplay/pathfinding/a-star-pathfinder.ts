import type { WalkGraph } from '../../shared/types/game';
import { vec3Distance } from '../../shared/utils/math';

interface QueueItem {
  nodeId: string;
  score: number;
}

function popLowestScore(queue: QueueItem[]): QueueItem | undefined {
  if (queue.length === 0) {
    return undefined;
  }

  let minIndex = 0;
  for (let index = 1; index < queue.length; index += 1) {
    if (queue[index].score < queue[minIndex].score) {
      minIndex = index;
    }
  }

  const [item] = queue.splice(minIndex, 1);
  return item;
}

function reconstructPath(cameFrom: Map<string, string>, current: string): string[] {
  const path = [current];
  let cursor = current;

  while (cameFrom.has(cursor)) {
    const parent = cameFrom.get(cursor);
    if (!parent) {
      break;
    }

    path.push(parent);
    cursor = parent;
  }

  return path.reverse();
}

export function findPath(graph: WalkGraph, startNodeId: string, goalNodeId: string): string[] | null {
  if (!graph.nodes[startNodeId] || !graph.nodes[goalNodeId]) {
    return null;
  }

  if (startNodeId === goalNodeId) {
    return [startNodeId];
  }

  const openQueue: QueueItem[] = [{ nodeId: startNodeId, score: 0 }];
  const openSet = new Set<string>([startNodeId]);

  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>([[startNodeId, 0]]);
  const fScore = new Map<string, number>([
    [
      startNodeId,
      vec3Distance(graph.nodes[startNodeId].worldPosition, graph.nodes[goalNodeId].worldPosition)
    ]
  ]);

  while (openQueue.length > 0) {
    const currentItem = popLowestScore(openQueue);
    if (!currentItem) {
      break;
    }

    const current = currentItem.nodeId;
    openSet.delete(current);

    if (current === goalNodeId) {
      return reconstructPath(cameFrom, current);
    }

    for (const edge of graph.adjacency[current] ?? []) {
      const tentativeG = (gScore.get(current) ?? Number.POSITIVE_INFINITY) + vec3Distance(
        graph.nodes[current].worldPosition,
        graph.nodes[edge.to].worldPosition
      );

      if (tentativeG >= (gScore.get(edge.to) ?? Number.POSITIVE_INFINITY)) {
        continue;
      }

      cameFrom.set(edge.to, current);
      gScore.set(edge.to, tentativeG);
      const estimate = tentativeG + vec3Distance(
        graph.nodes[edge.to].worldPosition,
        graph.nodes[goalNodeId].worldPosition
      );
      fScore.set(edge.to, estimate);

      if (!openSet.has(edge.to)) {
        openSet.add(edge.to);
        openQueue.push({ nodeId: edge.to, score: estimate });
      }
    }
  }

  return null;
}
