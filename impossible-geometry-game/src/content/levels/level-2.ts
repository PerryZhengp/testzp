import type { LevelDef } from '../../shared/types/game';

export const level2: LevelDef = {
  id: 'chapter1-level2',
  title: '第二关·旋塔分岔',
  chapterId: 'chapter1',
  description: '旋转中央高塔，选择唯一正确角度接通主路。',
  hint: '橙色机关会切换塔体朝向，90° 才能连上主线。',
  spawnNodeId: 'n0',
  goalNodeId: 'n5',
  camera: {
    zoom: 7.8,
    yawDeg: 41,
    pitchDeg: 34,
    target: [4.8, 0, 0.2]
  },
  anchors: [
    { id: 'aStart', basePosition: [0, 0, 0] },
    { id: 'aTower', basePosition: [4.8, 0, 0] },
    { id: 'aGoal', basePosition: [8.3, 0, 0.6] }
  ],
  nodes: [
    { id: 'n0', anchorId: 'aStart', localPosition: [0, 0, 0] },
    { id: 'n1', anchorId: 'aStart', localPosition: [2, 0, 0] },
    { id: 'n2', anchorId: 'aTower', localPosition: [-1.2, 0, 0] },
    { id: 'n3', anchorId: 'aTower', localPosition: [0.6, 0, 0] },
    { id: 'n4', anchorId: 'aTower', localPosition: [2.2, 0, 0.2] },
    { id: 'n5', anchorId: 'aGoal', localPosition: [0, 0, 0] }
  ],
  edges: [
    { id: 'e0', from: 'n0', to: 'n1', kind: 'real', bidirectional: true },
    {
      id: 'e1',
      from: 'n1',
      to: 'n2',
      kind: 'conditional',
      bidirectional: true,
      when: { all: [{ ref: 'rotatorA', eq: 90 }] }
    },
    { id: 'e2', from: 'n2', to: 'n3', kind: 'real', bidirectional: true },
    {
      id: 'e3',
      from: 'n3',
      to: 'n4',
      kind: 'conditional',
      bidirectional: true,
      when: { all: [{ ref: 'rotatorA', eq: 90 }] }
    },
    { id: 'e4', from: 'n4', to: 'n5', kind: 'real', bidirectional: true },
    {
      id: 'e5',
      from: 'n3',
      to: 'n1',
      kind: 'conditional',
      bidirectional: true,
      when: { all: [{ ref: 'rotatorA', eq: 180 }] }
    }
  ],
  interactables: [
    {
      id: 'rotatorA',
      displayName: '主塔旋钮',
      type: 'rotate',
      remote: true,
      anchorId: 'aTower',
      initialValue: 0,
      states: [
        { value: 0, durationMs: 520, label: '0°' },
        { value: 90, durationMs: 520, label: '90°' },
        { value: 180, durationMs: 520, label: '180°' }
      ],
      effects: {
        '0': { rotationDeg: [0, 0, 0] },
        '90': { rotationDeg: [0, 90, 0] },
        '180': { rotationDeg: [0, 180, 0] }
      }
    }
  ]
};
