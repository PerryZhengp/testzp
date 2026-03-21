import type { LevelDef } from '../../shared/types/game';

export const level6: LevelDef = {
  id: 'chapter1-level6',
  title: '第六关·三相棱镜',
  chapterId: 'chapter1',
  description: '双棱镜与桥体联动，错误角度会把你送回起点侧。',
  hint: '先把左棱镜转到 120°，再把右棱镜调到 240°。',
  spawnNodeId: 'n0',
  goalNodeId: 'n6',
  camera: {
    zoom: 9.6,
    yawDeg: 49,
    pitchDeg: 38,
    target: [7.2, 0, 0.4]
  },
  anchors: [
    { id: 'aStart', basePosition: [0, 0, 0] },
    { id: 'aPrismA', basePosition: [3.5, 0, -1.3] },
    { id: 'aBridge', basePosition: [6.4, 0, 0] },
    { id: 'aPrismB', basePosition: [9.1, 0, 1.4] },
    { id: 'aGoal', basePosition: [12, 0, 0.7] }
  ],
  nodes: [
    { id: 'n0', anchorId: 'aStart', localPosition: [0, 0, 0] },
    { id: 'n1', anchorId: 'aStart', localPosition: [1.9, 0, 0] },
    { id: 'n2', anchorId: 'aPrismA', localPosition: [0, 0, 0] },
    { id: 'n3', anchorId: 'aBridge', localPosition: [0, 0, 0] },
    { id: 'n4', anchorId: 'aPrismB', localPosition: [0, 0, 0] },
    { id: 'n5', anchorId: 'aGoal', localPosition: [0, 0, 0] },
    { id: 'n6', anchorId: 'aGoal', localPosition: [2, 0, 0] }
  ],
  edges: [
    { id: 'e0', from: 'n0', to: 'n1', kind: 'real', bidirectional: true },
    {
      id: 'e1',
      from: 'n1',
      to: 'n2',
      kind: 'conditional',
      bidirectional: true,
      when: {
        any: [
          { ref: 'prismA', eq: 120 },
          { ref: 'prismA', eq: 240 }
        ]
      }
    },
    {
      id: 'e2',
      from: 'n2',
      to: 'n3',
      kind: 'conditional',
      bidirectional: true,
      when: { all: [{ ref: 'bridgeLift', eq: 'up' }] }
    },
    {
      id: 'e3',
      from: 'n3',
      to: 'n4',
      kind: 'conditional',
      bidirectional: true,
      when: {
        all: [
          { ref: 'prismA', eq: 120 },
          { ref: 'prismB', eq: 240 },
          { ref: 'bridgeSlide', eq: 'center' }
        ]
      }
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
          { ref: 'bridgeLift', eq: 'up' },
          { ref: 'bridgeSlide', eq: 'center' },
          { ref: 'prismB', eq: 240 }
        ]
      }
    },
    { id: 'e5', from: 'n5', to: 'n6', kind: 'real', bidirectional: true },
    {
      id: 'e6',
      from: 'n2',
      to: 'n4',
      kind: 'conditional',
      bidirectional: true,
      when: {
        all: [
          { ref: 'prismA', eq: 240 },
          { ref: 'prismB', eq: 120 }
        ]
      }
    }
  ],
  interactables: [
    {
      id: 'prismA',
      displayName: '左棱镜',
      type: 'rotate',
      remote: true,
      anchorId: 'aPrismA',
      initialValue: 0,
      states: [
        { value: 0, durationMs: 520, label: '0°' },
        { value: 120, durationMs: 520, label: '120°' },
        { value: 240, durationMs: 520, label: '240°' }
      ],
      effects: {
        '0': { rotationDeg: [0, 0, 0] },
        '120': { rotationDeg: [0, 120, 0] },
        '240': { rotationDeg: [0, 240, 0] }
      }
    },
    {
      id: 'prismB',
      displayName: '右棱镜',
      type: 'rotate',
      remote: true,
      anchorId: 'aPrismB',
      initialValue: 120,
      states: [
        { value: 0, durationMs: 520, label: '0°' },
        { value: 120, durationMs: 520, label: '120°' },
        { value: 240, durationMs: 520, label: '240°' }
      ],
      effects: {
        '0': { rotationDeg: [0, 0, 0] },
        '120': { rotationDeg: [0, 120, 0] },
        '240': { rotationDeg: [0, 240, 0] }
      }
    },
    {
      id: 'bridgeLift',
      displayName: '桥体升降',
      type: 'lift',
      remote: true,
      anchorId: 'aBridge',
      initialValue: 'down',
      states: [
        { value: 'down', durationMs: 520, label: '下沉' },
        { value: 'up', durationMs: 520, label: '抬升' }
      ],
      effects: {
        down: { positionOffset: [0, -1.5, 0] },
        up: { positionOffset: [0, 0, 0] }
      }
    },
    {
      id: 'bridgeSlide',
      displayName: '桥体滑轨',
      type: 'slide',
      remote: true,
      anchorId: 'aBridge',
      initialValue: 'left',
      states: [
        { value: 'left', durationMs: 450, label: '左位' },
        { value: 'center', durationMs: 450, label: '中位' },
        { value: 'right', durationMs: 450, label: '右位' }
      ],
      effects: {
        left: { positionOffset: [-1.3, 0, 0] },
        center: { positionOffset: [0, 0, 0] },
        right: { positionOffset: [1.3, 0, 0] }
      }
    }
  ]
};
