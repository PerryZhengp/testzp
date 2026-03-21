export type Scalar = string | number | boolean;

export type Vec3 = [number, number, number];

export interface ConditionAtom {
  ref: string;
  eq: Scalar;
}

export interface ConditionDef {
  all?: ConditionAtom[];
  any?: ConditionAtom[];
  not?: ConditionAtom[];
}

export interface AnchorDef {
  id: string;
  basePosition: Vec3;
  baseRotationDeg?: Vec3;
}

export interface AnchorTransformDelta {
  positionOffset?: Vec3;
  rotationDeg?: Vec3;
}

export interface NodeDef {
  id: string;
  anchorId: string;
  localPosition: Vec3;
}

export type EdgeKind = 'real' | 'conditional' | 'illusory';

export interface EdgeDef {
  id: string;
  from: string;
  to: string;
  kind: EdgeKind;
  bidirectional?: boolean;
  when?: ConditionDef;
  thresholdNdc?: number;
}

export type InteractableType = 'rotate' | 'slide' | 'lift';

export interface InteractableStateDef {
  value: Scalar;
  durationMs: number;
  label?: string;
}

export interface InteractableDef {
  id: string;
  type: InteractableType;
  remote: boolean;
  anchorId: string;
  initialValue: Scalar;
  states: InteractableStateDef[];
  effects?: Record<string, AnchorTransformDelta>;
  displayName: string;
}

export interface CameraDef {
  zoom: number;
  yawDeg: number;
  pitchDeg: number;
  target: Vec3;
}

export interface LevelDef {
  id: string;
  title: string;
  chapterId: string;
  description: string;
  hint: string;
  spawnNodeId: string;
  goalNodeId: string;
  camera: CameraDef;
  anchors: AnchorDef[];
  nodes: NodeDef[];
  edges: EdgeDef[];
  interactables: InteractableDef[];
}

export interface ChapterDef {
  id: string;
  title: string;
  levelIds: string[];
}

export interface SaveDataV1 {
  version: 1;
  unlockedLevelIds: string[];
  completedLevelIds: string[];
  lastPlayedLevelId?: string;
  settings: {
    language: 'zh-CN' | 'en';
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    reducedMotion: boolean;
  };
}

export interface AnchorRuntime {
  id: string;
  worldPosition: Vec3;
  worldRotationDeg: Vec3;
}

export interface GraphNodeRuntime {
  id: string;
  worldPosition: Vec3;
}

export interface GraphEdgeRuntime {
  id: string;
  from: string;
  to: string;
  kind: EdgeKind;
}

export interface WalkGraph {
  nodes: Record<string, GraphNodeRuntime>;
  adjacency: Record<string, GraphEdgeRuntime[]>;
}

export interface GraphBuildResult {
  graph: WalkGraph;
  anchors: Record<string, AnchorRuntime>;
  illusoryDistances: Record<string, number>;
}

export interface HitTarget {
  kind: 'node' | 'interactable';
  id: string;
}
