import type { LevelDef } from '../../shared/types/game';

export const level1: LevelDef = {
  id: 'chapter1-level1',
  title: '第一关·初见回廊',
  chapterId: 'chapter1',
  description: '熟悉点击移动与路线观察，抵达终点祭台。',
  hint: '先从左侧直桥前进，别被上方的支路分心。',
  spawnNodeId: 'n0',
  goalNodeId: 'n5',
  camera: {
    zoom: 7.1,
    yawDeg: 37,
    pitchDeg: 31,
    target: [3.8, 0, 0.1]
  },
  anchors: [
    { id: 'aStart', basePosition: [0, 0, 0] },
    { id: 'aMiddle', basePosition: [3.2, 0, 0.3] },
    { id: 'aGoal', basePosition: [6.8, 0, -0.1] }
  ],
  nodes: [
    { id: 'n0', anchorId: 'aStart', localPosition: [0, 0, 0] },
    { id: 'n1', anchorId: 'aStart', localPosition: [1.8, 0, 0] },
    { id: 'n2', anchorId: 'aMiddle', localPosition: [-0.3, 0, 0.2] },
    { id: 'n3', anchorId: 'aMiddle', localPosition: [1.9, 0, -0.2] },
    { id: 'n4', anchorId: 'aGoal', localPosition: [0, 0, 0] },
    { id: 'n5', anchorId: 'aGoal', localPosition: [1.8, 0, 0] },
    { id: 'n6', anchorId: 'aMiddle', localPosition: [0.8, 0, 1.5] }
  ],
  edges: [
    { id: 'e0', from: 'n0', to: 'n1', kind: 'real', bidirectional: true },
    { id: 'e1', from: 'n1', to: 'n2', kind: 'real', bidirectional: true },
    { id: 'e2', from: 'n2', to: 'n3', kind: 'real', bidirectional: true },
    { id: 'e3', from: 'n3', to: 'n4', kind: 'real', bidirectional: true },
    { id: 'e4', from: 'n4', to: 'n5', kind: 'real', bidirectional: true },
    { id: 'e5', from: 'n2', to: 'n6', kind: 'real', bidirectional: true }
  ],
  interactables: []
};
