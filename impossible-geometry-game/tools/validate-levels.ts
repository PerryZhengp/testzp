import { readdirSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { MathUtils, OrthographicCamera, Vector3 } from 'three';
import { orderedLevels } from '../src/content/levels';
import { GraphBuilder } from '../src/gameplay/graph/graph-builder';
import { bfsReachable } from '../src/shared/utils/graph';
import { scalarKey } from '../src/shared/utils/math';
import type { LevelDef, Scalar } from '../src/shared/types/game';

interface ValidationError {
  levelId: string;
  code: string;
  message: string;
}

interface ValidationResult {
  ok: boolean;
  checkedLevels: number;
  errors: ValidationError[];
}

function createValidationCamera(level: LevelDef): OrthographicCamera {
  const camera = new OrthographicCamera(-10, 10, 10, -10, 0.1, 200);
  const yaw = MathUtils.degToRad(level.camera.yawDeg);
  const pitch = MathUtils.degToRad(level.camera.pitchDeg);
  const distance = Math.max(8, level.camera.zoom * 2.4);
  const x = level.camera.target[0] + distance * Math.cos(pitch) * Math.cos(yaw);
  const y = level.camera.target[1] + distance * Math.sin(pitch);
  const z = level.camera.target[2] + distance * Math.cos(pitch) * Math.sin(yaw);

  camera.position.set(x, y, z);
  camera.zoom = Math.max(0.5, level.camera.zoom / 4.5);
  camera.lookAt(new Vector3(level.camera.target[0], level.camera.target[1], level.camera.target[2]));
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  return camera;
}

function stateKey(playerNodeId: string, values: Record<string, Scalar>, interactableOrder: string[]): string {
  const tail = interactableOrder.map((id) => `${id}=${scalarKey(values[id])}`).join('|');
  return `${playerNodeId}|${tail}`;
}

function nextInteractableValue(level: LevelDef, interactableId: string, currentValue: Scalar): Scalar {
  const interactable = level.interactables.find((item) => item.id === interactableId);
  if (!interactable || interactable.states.length === 0) {
    return currentValue;
  }

  const currentIndex = interactable.states.findIndex((state) => state.value === currentValue);
  const nextIndex = (currentIndex + 1) % interactable.states.length;
  return interactable.states[nextIndex].value;
}

function loadBuiltInLevels(): LevelDef[] {
  return orderedLevels;
}

async function loadLevelsFromDirectory(levelDir: string): Promise<LevelDef[]> {
  const root = resolve(levelDir);
  const files = readdirSync(root).filter((file) => {
    const extension = extname(file);
    return (extension === '.ts' || extension === '.js') && !file.startsWith('index.');
  });

  const levels: LevelDef[] = [];

  for (const file of files) {
    const moduleUrl = pathToFileURL(resolve(root, file)).href;
    const moduleObject = await import(moduleUrl);
    for (const exported of Object.values(moduleObject)) {
      if (isLevelLike(exported)) {
        levels.push(exported);
      }
    }
  }

  return levels;
}

function isLevelLike(value: unknown): value is LevelDef {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<LevelDef>;
  return (
    typeof candidate.id === 'string' &&
    Array.isArray(candidate.nodes) &&
    Array.isArray(candidate.edges) &&
    Array.isArray(candidate.anchors) &&
    Array.isArray(candidate.interactables)
  );
}

function validateLevel(level: LevelDef, errors: ValidationError[]): void {
  const push = (code: string, message: string): void => {
    errors.push({ levelId: level.id, code, message });
  };

  const nodeIds = new Set<string>();
  const edgeIds = new Set<string>();
  const anchorIds = new Set<string>();
  const interactableIds = new Set<string>();

  for (const anchor of level.anchors) {
    if (anchorIds.has(anchor.id)) {
      push('DUPLICATE_ANCHOR_ID', `Duplicate anchor id: ${anchor.id}`);
    }
    anchorIds.add(anchor.id);
  }

  for (const node of level.nodes) {
    if (nodeIds.has(node.id)) {
      push('DUPLICATE_NODE_ID', `Duplicate node id: ${node.id}`);
    }
    nodeIds.add(node.id);
    if (!anchorIds.has(node.anchorId)) {
      push('MISSING_ANCHOR_REF', `Node ${node.id} references missing anchor ${node.anchorId}`);
    }
  }

  for (const edge of level.edges) {
    if (edgeIds.has(edge.id)) {
      push('DUPLICATE_EDGE_ID', `Duplicate edge id: ${edge.id}`);
    }
    edgeIds.add(edge.id);

    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
      push('MISSING_NODE_REF', `Edge ${edge.id} references unknown node(s): ${edge.from} -> ${edge.to}`);
    }

    if (edge.kind === 'illusory' && typeof edge.thresholdNdc !== 'number') {
      push('MISSING_ILLUSORY_THRESHOLD', `Illusory edge ${edge.id} is missing thresholdNdc`);
    }
  }

  for (const interactable of level.interactables) {
    if (interactableIds.has(interactable.id)) {
      push('DUPLICATE_INTERACTABLE_ID', `Duplicate interactable id: ${interactable.id}`);
    }
    interactableIds.add(interactable.id);

    if (!anchorIds.has(interactable.anchorId)) {
      push(
        'MISSING_ANCHOR_REF',
        `Interactable ${interactable.id} references missing anchor ${interactable.anchorId}`
      );
    }

    if (!interactable.states.some((state) => state.value === interactable.initialValue)) {
      push(
        'INITIAL_VALUE_NOT_IN_STATES',
        `Interactable ${interactable.id} initialValue is not present in states`
      );
    }
  }

  if (!nodeIds.has(level.spawnNodeId)) {
    push('MISSING_SPAWN_NODE', `spawnNodeId ${level.spawnNodeId} does not exist`);
  }

  if (!nodeIds.has(level.goalNodeId)) {
    push('MISSING_GOAL_NODE', `goalNodeId ${level.goalNodeId} does not exist`);
  }

  if (errors.some((error) => error.levelId === level.id)) {
    return;
  }

  const camera = createValidationCamera(level);
  const graphBuilder = new GraphBuilder();
  const interactableOrder = level.interactables.map((item) => item.id);
  const initialState = Object.fromEntries(
    level.interactables.map((interactable) => [interactable.id, interactable.initialValue])
  );

  const queue: Array<{ nodeId: string; values: Record<string, Scalar> }> = [
    { nodeId: level.spawnNodeId, values: initialState }
  ];
  const visited = new Set<string>();
  let foundSolution = false;
  let safetyCounter = 0;

  while (queue.length > 0) {
    safetyCounter += 1;
    if (safetyCounter > 120_000) {
      push('STATE_SPACE_OVERFLOW', 'State search exceeded safety bound.');
      break;
    }

    const current = queue.shift();
    if (!current) {
      break;
    }

    const key = stateKey(current.nodeId, current.values, interactableOrder);
    if (visited.has(key)) {
      continue;
    }
    visited.add(key);

    const built = graphBuilder.build(level, current.values, camera, 16 / 9);
    const currentNode = built.graph.nodes[current.nodeId];
    if (!currentNode) {
      push(
        'INVALID_STAND_NODE',
        `State ${key} invalidates current stand node after graph rebuild (forbidden).`
      );
      continue;
    }

    const reachableNodes = bfsReachable(built.graph, current.nodeId);
    if (reachableNodes.has(level.goalNodeId)) {
      foundSolution = true;
      break;
    }

    for (const nodeId of reachableNodes) {
      const moveKey = stateKey(nodeId, current.values, interactableOrder);
      if (!visited.has(moveKey)) {
        queue.push({ nodeId, values: { ...current.values } });
      }
    }

    for (const interactableId of interactableOrder) {
      const nextValue = nextInteractableValue(level, interactableId, current.values[interactableId]);
      const nextValues = {
        ...current.values,
        [interactableId]: nextValue
      };

      const nextBuild = graphBuilder.build(level, nextValues, camera, 16 / 9);
      if (!nextBuild.graph.nodes[current.nodeId]) {
        push(
          'INVALID_STAND_NODE',
          `Interactable ${interactableId} can invalidate player stand node at ${current.nodeId}.`
        );
        continue;
      }

      const interactionKey = stateKey(current.nodeId, nextValues, interactableOrder);
      if (!visited.has(interactionKey)) {
        queue.push({ nodeId: current.nodeId, values: nextValues });
      }
    }
  }

  if (!foundSolution) {
    push('UNSOLVABLE_LEVEL', 'No solution found in reachable state space.');
  }
}

async function main(): Promise<void> {
  const levelDir = process.argv[2] ?? 'src/content/levels';
  const levels = levelDir === 'src/content/levels' ? loadBuiltInLevels() : await loadLevelsFromDirectory(levelDir);
  const errors: ValidationError[] = [];

  const levelIds = new Set<string>();
  for (const level of levels) {
    if (levelIds.has(level.id)) {
      errors.push({
        levelId: level.id,
        code: 'DUPLICATE_LEVEL_ID',
        message: `Duplicate level id: ${level.id}`
      });
    }
    levelIds.add(level.id);
  }

  for (const level of levels) {
    validateLevel(level, errors);
  }

  const result: ValidationResult = {
    ok: errors.length === 0,
    checkedLevels: levels.length,
    errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.ok) {
    process.exitCode = 1;
  }
}

void main();
