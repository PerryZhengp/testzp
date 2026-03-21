import type { LevelDef } from '../../shared/types/game';

export const level4: LevelDef = {
  id: 'chapter1-level4',
  title: '第四关·双塔并轨',
  chapterId: 'chapter1',
  description: '北塔、脊柱、南塔需要同时校准，才能形成终段错视桥。',
  hint: '先把两座塔都转正，再把脊柱滑轨调到中位。',
  spawnNodeId: 'n0',
  goalNodeId: 'n6',
  camera: {
    zoom: 9.1,
    yawDeg: 47,
    pitchDeg: 36,
    target: [6.6, 0, 0.3]
  },
  anchors: [
    { id: 'aStart', basePosition: [0, 0, 0] },
    { id: 'aNorth', basePosition: [3.6, 0, -1.4] },
    { id: 'aSpine', basePosition: [6.2, 0, 0] },
    { id: 'aSouth', basePosition: [8.7, 0, 1.3] },
    { id: 'aGoal', basePosition: [11.3, 0, 0.6] }
  ],
  nodes: [
    { id: 'n0', anchorId: 'aStart', localPosition: [0, 0, 0] },
    { id: 'n1', anchorId: 'aStart', localPosition: [2, 0, 0] },
    { id: 'n2', anchorId: 'aNorth', localPosition: [0, 0, 0] },
    { id: 'n3', anchorId: 'aSpine', localPosition: [0, 0, 0] },
    { id: 'n4', anchorId: 'aSouth', localPosition: [0, 0, 0] },
    { id: 'n5', anchorId: 'aGoal', localPosition: [0, 0, 0] },
    { id: 'n6', anchorId: 'aGoal', localPosition: [1.9, 0, 0] }
  ],
  edges: [
    { id: 'e0', from: 'n0', to: 'n1', kind: 'real', bidirectional: true },
    {
      id: 'e1',
      from: 'n1',
      to: 'n2',
      kind: 'conditional',
      bidirectional: true,
      when: { all: [{ ref: 'rotatorNorth', eq: 90 }] }
    },
    {
      id: 'e2',
      from: 'n2',
      to: 'n3',
      kind: 'conditional',
      bidirectional: true,
      when: { all: [{ ref: 'slideSpine', eq: 'center' }] }
    },
    {
      id: 'e3',
      from: 'n3',
      to: 'n4',
      kind: 'conditional',
      bidirectional: true,
      when: { all: [{ ref: 'rotatorSouth', eq: 90 }] }
    },
    {
      id: 'e4',
      from: 'n4',
      to: 'n5',
      kind: 'illusory',
      bidirectional: true,
      thresholdNdc: 0.62,
      when: {
        all: [
          { ref: 'rotatorNorth', eq: 90 },
          { ref: 'slideSpine', eq: 'center' },
          { ref: 'rotatorSouth', eq: 90 }
        ]
      }
    },
    { id: 'e5', from: 'n5', to: 'n6', kind: 'real', bidirectional: true }
  ],
  interactables: [
    {
      id: 'rotatorNorth',
      displayName: '北塔旋钮',
      type: 'rotate',
      remote: true,
      anchorId: 'aNorth',
      initialValue: 0,
      states: [
        { value: 0, durationMs: 500, label: '0°' },
        { value: 90, durationMs: 500, label: '90°' }
      ],
      effects: {
        '0': { rotationDeg: [0, 0, 0] },
        '90': { rotationDeg: [0, 90, 0] }
      }
    },
    {
      id: 'slideSpine',
      displayName: '脊柱滑轨',
      type: 'slide',
      remote: true,
      anchorId: 'aSpine',
      initialValue: 'left',
      states: [
        { value: 'left', durationMs: 450, label: '左位' },
        { value: 'center', durationMs: 450, label: '中位' },
        { value: 'right', durationMs: 450, label: '右位' }
      ],
      effects: {
        left: { positionOffset: [-1.4, 0, 0] },
        center: { positionOffset: [0, 0, 0] },
        right: { positionOffset: [1.4, 0, 0] }
      }
    },
    {
      id: 'rotatorSouth',
      displayName: '南塔旋钮',
      type: 'rotate',
      remote: true,
      anchorId: 'aSouth',
      initialValue: 0,
      states: [
        { value: 0, durationMs: 500, label: '0°' },
        { value: 90, durationMs: 500, label: '90°' }
      ],
      effects: {
        '0': { rotationDeg: [0, 0, 0] },
        '90': { rotationDeg: [0, 90, 0] }
      }
    }
  ]
};
