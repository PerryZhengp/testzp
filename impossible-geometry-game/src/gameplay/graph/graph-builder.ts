import { Euler, MathUtils, OrthographicCamera, Vector3 } from 'three';
import type {
  AnchorDef,
  AnchorRuntime,
  EdgeDef,
  GraphBuildResult,
  GraphEdgeRuntime,
  GraphNodeRuntime,
  LevelDef,
  Vec3,
  WalkGraph
} from '../../shared/types/game';
import type { StateMap } from '../../shared/utils/condition';
import { scalarKey } from '../../shared/utils/math';
import { evaluateCondition } from '../validation/condition-evaluator';
import { computeIllusoryDistanceNdc } from './illusory-edge-resolver';

interface MutableAnchor {
  position: Vec3;
  rotation: Vec3;
}

function createAnchorAccumulator(anchor: AnchorDef): MutableAnchor {
  return {
    position: [...anchor.basePosition],
    rotation: [...(anchor.baseRotationDeg ?? [0, 0, 0])]
  };
}

function addVec3(base: Vec3, delta: Vec3): Vec3 {
  return [base[0] + delta[0], base[1] + delta[1], base[2] + delta[2]];
}

function buildNodeWorldPosition(localPosition: Vec3, anchor: MutableAnchor): Vec3 {
  const local = new Vector3(localPosition[0], localPosition[1], localPosition[2]);
  const rotation = new Euler(
    MathUtils.degToRad(anchor.rotation[0]),
    MathUtils.degToRad(anchor.rotation[1]),
    MathUtils.degToRad(anchor.rotation[2]),
    'XYZ'
  );

  const rotated = local.applyEuler(rotation);
  return [
    rotated.x + anchor.position[0],
    rotated.y + anchor.position[1],
    rotated.z + anchor.position[2]
  ];
}

function addDirectedEdge(adjacency: WalkGraph['adjacency'], edge: GraphEdgeRuntime): void {
  adjacency[edge.from] ??= [];
  adjacency[edge.from].push(edge);
}

function activateEdge(
  adjacency: WalkGraph['adjacency'],
  edge: EdgeDef,
  bidirectional: boolean
): void {
  addDirectedEdge(adjacency, {
    id: edge.id,
    from: edge.from,
    to: edge.to,
    kind: edge.kind
  });

  if (bidirectional) {
    addDirectedEdge(adjacency, {
      id: edge.id,
      from: edge.to,
      to: edge.from,
      kind: edge.kind
    });
  }
}

export class GraphBuilder {
  build(
    level: LevelDef,
    state: StateMap,
    camera: OrthographicCamera,
    aspect: number
  ): GraphBuildResult {
    const mutableAnchors: Record<string, MutableAnchor> = {};

    for (const anchor of level.anchors) {
      mutableAnchors[anchor.id] = createAnchorAccumulator(anchor);
    }

    for (const interactable of level.interactables) {
      const effect = interactable.effects?.[scalarKey(state[interactable.id])];
      if (!effect) {
        continue;
      }

      const anchor = mutableAnchors[interactable.anchorId];
      if (!anchor) {
        continue;
      }

      if (effect.positionOffset) {
        anchor.position = addVec3(anchor.position, effect.positionOffset);
      }

      if (effect.rotationDeg) {
        anchor.rotation = addVec3(anchor.rotation, effect.rotationDeg);
      }
    }

    const nodeMap: Record<string, GraphNodeRuntime> = {};
    const adjacency: WalkGraph['adjacency'] = {};
    const anchors: Record<string, AnchorRuntime> = {};

    for (const [anchorId, anchor] of Object.entries(mutableAnchors)) {
      anchors[anchorId] = {
        id: anchorId,
        worldPosition: anchor.position,
        worldRotationDeg: anchor.rotation
      };
    }

    for (const node of level.nodes) {
      const anchor = mutableAnchors[node.anchorId];
      if (!anchor) {
        continue;
      }

      nodeMap[node.id] = {
        id: node.id,
        worldPosition: buildNodeWorldPosition(node.localPosition, anchor)
      };
      adjacency[node.id] = [];
    }

    const illusoryDistances: Record<string, number> = {};

    for (const edge of level.edges) {
      if (!nodeMap[edge.from] || !nodeMap[edge.to]) {
        continue;
      }

      if (!evaluateCondition(edge.when, state)) {
        continue;
      }

      const bidirectional = edge.bidirectional ?? true;

      if (edge.kind === 'illusory') {
        const threshold = edge.thresholdNdc ?? 0.02;
        const distance = computeIllusoryDistanceNdc(
          nodeMap[edge.from].worldPosition,
          nodeMap[edge.to].worldPosition,
          camera,
          aspect
        );

        illusoryDistances[edge.id] = distance;

        if (distance > threshold) {
          continue;
        }
      }

      activateEdge(adjacency, edge, bidirectional);
    }

    return {
      graph: {
        nodes: nodeMap,
        adjacency
      },
      anchors,
      illusoryDistances
    };
  }
}
