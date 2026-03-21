import { OrthographicCamera } from 'three';
import type {
  AnchorRuntime,
  GraphBuildResult,
  InteractableDef,
  InteractableStateDef,
  LevelDef,
  Scalar,
  WalkGraph
} from '../../shared/types/game';
import type { StateMap } from '../../shared/utils/condition';
import { scalarKey } from '../../shared/utils/math';
import { GraphBuilder } from '../graph/graph-builder';

export class LevelRuntime {
  readonly level: LevelDef;

  currentNodeId: string;

  interactableValues: StateMap;

  graph: WalkGraph;

  anchors: Record<string, AnchorRuntime>;

  illusoryDistances: Record<string, number>;

  private readonly graphBuilder = new GraphBuilder();

  constructor(level: LevelDef) {
    this.level = level;
    this.currentNodeId = level.spawnNodeId;
    this.interactableValues = this.createInitialValues();
    this.graph = { nodes: {}, adjacency: {} };
    this.anchors = {};
    this.illusoryDistances = {};
  }

  reset(): void {
    this.currentNodeId = this.level.spawnNodeId;
    this.interactableValues = this.createInitialValues();
  }

  rebuild(camera: OrthographicCamera, aspect: number): GraphBuildResult {
    const result = this.graphBuilder.build(this.level, this.interactableValues, camera, aspect);
    this.graph = result.graph;
    this.anchors = result.anchors;
    this.illusoryDistances = result.illusoryDistances;
    return result;
  }

  getCurrentNodePosition(): [number, number, number] {
    const node = this.graph.nodes[this.currentNodeId];
    if (!node) {
      throw new Error(`Current node ${this.currentNodeId} missing from graph.`);
    }

    return node.worldPosition;
  }

  setCurrentNode(nodeId: string): void {
    if (!this.graph.nodes[nodeId]) {
      throw new Error(`Cannot set current node to unknown id ${nodeId}`);
    }

    this.currentNodeId = nodeId;
  }

  getInteractable(interactableId: string): InteractableDef {
    const interactable = this.level.interactables.find((item) => item.id === interactableId);
    if (!interactable) {
      throw new Error(`Unknown interactable ${interactableId}`);
    }

    return interactable;
  }

  getInteractableValue(interactableId: string): Scalar {
    return this.interactableValues[interactableId];
  }

  getNextInteractableState(interactableId: string): InteractableStateDef {
    const interactable = this.getInteractable(interactableId);
    const current = this.interactableValues[interactableId];
    const currentIndex = interactable.states.findIndex((state) => state.value === current);
    const nextIndex = (currentIndex + 1) % interactable.states.length;
    return interactable.states[nextIndex];
  }

  setInteractableValue(interactableId: string, value: Scalar): void {
    this.interactableValues[interactableId] = value;
  }

  private createInitialValues(): StateMap {
    return Object.fromEntries(
      this.level.interactables.map((interactable) => [interactable.id, interactable.initialValue])
    );
  }

  cloneState(): StateMap {
    return { ...this.interactableValues };
  }

  getInteractableValueKey(interactableId: string): string {
    return scalarKey(this.interactableValues[interactableId]);
  }
}
