import type { LevelDef } from '../../shared/types/game';

export const level1: LevelDef = {
  id: 'chapter1-level1',
  title: 'L1 · First Steps',
  chapterId: 'chapter1',
  description: 'Learn click-to-move and reach the altar.',
  hint: 'Follow the glowing nodes in sequence. The path is already open.',
  spawnNodeId: 'n0',
  goalNodeId: 'n3',
  camera: {
    zoom: 7,
    yawDeg: 38,
    pitchDeg: 32,
    target: [3.5, 0, 0]
  },
  anchors: [
    { id: 'a0', basePosition: [0, 0, 0] },
    { id: 'a1', basePosition: [4, 0, 0] }
  ],
  nodes: [
    { id: 'n0', anchorId: 'a0', localPosition: [0, 0, 0] },
    { id: 'n1', anchorId: 'a0', localPosition: [2, 0, 0] },
    { id: 'n2', anchorId: 'a1', localPosition: [0, 0, 0] },
    { id: 'n3', anchorId: 'a1', localPosition: [2, 0, 0] }
  ],
  edges: [
    { id: 'e0', from: 'n0', to: 'n1', kind: 'real', bidirectional: true },
    { id: 'e1', from: 'n1', to: 'n2', kind: 'real', bidirectional: true },
    { id: 'e2', from: 'n2', to: 'n3', kind: 'real', bidirectional: true }
  ],
  interactables: []
};
