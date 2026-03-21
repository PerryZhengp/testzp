import { findPath } from '../../src/gameplay/pathfinding/a-star-pathfinder';
import type { WalkGraph } from '../../src/shared/types/game';

function buildGraph(): WalkGraph {
  return {
    nodes: {
      a: { id: 'a', worldPosition: [0, 0, 0] },
      b: { id: 'b', worldPosition: [1, 0, 0] },
      c: { id: 'c', worldPosition: [2, 0, 0] },
      d: { id: 'd', worldPosition: [2, 0, 1] }
    },
    adjacency: {
      a: [{ id: 'e0', from: 'a', to: 'b', kind: 'real' }],
      b: [
        { id: 'e0', from: 'b', to: 'a', kind: 'real' },
        { id: 'e1', from: 'b', to: 'c', kind: 'real' }
      ],
      c: [
        { id: 'e1', from: 'c', to: 'b', kind: 'real' },
        { id: 'e2', from: 'c', to: 'd', kind: 'real' }
      ],
      d: [{ id: 'e2', from: 'd', to: 'c', kind: 'real' }]
    }
  };
}

describe('findPath', () => {
  it('finds shortest path', () => {
    const graph = buildGraph();
    expect(findPath(graph, 'a', 'd')).toEqual(['a', 'b', 'c', 'd']);
  });

  it('returns null when unreachable', () => {
    const graph = buildGraph();
    graph.adjacency.c = [];
    graph.adjacency.d = [];
    expect(findPath(graph, 'a', 'd')).toBeNull();
  });
});
