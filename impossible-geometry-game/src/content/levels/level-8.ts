import type { LevelDef } from '../../shared/types/game';

export const level8: LevelDef = {
  id: 'chapter1-level8',
  title: '第八关·天穹终局',
  chapterId: 'chapter1',
  description: '终章要求连续两次改态推进，任何一步都不能提前或滞后。',
  hint: '先用右位突破前段，再在中段改为中位，同时把冠轮调到 180°。',
  spawnNodeId: 'n0',
  goalNodeId: 'n9',
  camera: {
    zoom: 10.2,
    yawDeg: 50,
    pitchDeg: 38,
    target: [8.2, 0, 0.4]
  },
  anchors: [
    { id: 'aStart', basePosition: [0, 0, 0] },
    { id: 'aBridge', basePosition: [3.4, 0, -1.2] },
    { id: 'aCrown', basePosition: [6.3, 0, 0] },
    { id: 'aLens', basePosition: [8.9, 0, 1.4] },
    { id: 'aGate', basePosition: [11.4, 0, 0] },
    { id: 'aGoal', basePosition: [14.2, 0, 0.8] }
  ],
  nodes: [
    { id: 'n0', anchorId: 'aStart', localPosition: [0, 0, 0] },
    { id: 'n1', anchorId: 'aStart', localPosition: [1.9, 0, 0] },
    { id: 'n2', anchorId: 'aBridge', localPosition: [0, 0, 0] },
    { id: 'n3', anchorId: 'aCrown', localPosition: [0, 0, 0] },
    { id: 'n4', anchorId: 'aLens', localPosition: [0, 0, 0] },
    { id: 'n5', anchorId: 'aGate', localPosition: [0, 0, 0] },
    { id: 'n6', anchorId: 'aGate', localPosition: [1.6, 0, 0] },
    { id: 'n7', anchorId: 'aGoal', localPosition: [0, 0, 0] },
    { id: 'n8', anchorId: 'aGoal', localPosition: [1.8, 0, 0] },
    { id: 'n9', anchorId: 'aGoal', localPosition: [3.3, 0, -0.2] }
  ],
  edges: [
    { id: 'e0', from: 'n0', to: 'n1', kind: 'real', bidirectional: true },
    {
      id: 'e1',
      from: 'n1',
      to: 'n2',
      kind: 'conditional',
      bidirectional: true,
      when: { all: [{ ref: 'bridgeSlide', eq: 'right' }] }
    },
    {
      id: 'e2',
      from: 'n2',
      to: 'n3',
      kind: 'conditional',
      bidirectional: true,
      when: { all: [{ ref: 'crownRotate', eq: 90 }] }
    },
    {
      id: 'e3',
      from: 'n3',
      to: 'n4',
      kind: 'conditional',
      bidirectional: true,
      when: { all: [{ ref: 'bridgeLift', eq: 'up' }] }
    },
    {
      id: 'e4',
      from: 'n4',
      to: 'n5',
      kind: 'illusory',
      bidirectional: true,
      thresholdNdc: 0.66,
      when: {
        all: [
          { ref: 'lensRotate', eq: 90 },
          { ref: 'gateShift', eq: 'far' },
          { ref: 'bridgeSlide', eq: 'right' }
        ]
      }
    },
    {
      id: 'e5',
      from: 'n5',
      to: 'n6',
      kind: 'conditional',
      bidirectional: true,
      when: { all: [{ ref: 'bridgeSlide', eq: 'center' }] }
    },
    {
      id: 'e6',
      from: 'n6',
      to: 'n7',
      kind: 'conditional',
      bidirectional: true,
      when: { all: [{ ref: 'crownRotate', eq: 180 }] }
    },
    {
      id: 'e7',
      from: 'n7',
      to: 'n8',
      kind: 'illusory',
      bidirectional: true,
      thresholdNdc: 0.58,
      when: {
        all: [
          { ref: 'bridgeLift', eq: 'up' },
          { ref: 'gateShift', eq: 'far' },
          { ref: 'bridgeSlide', eq: 'center' },
          { ref: 'lensRotate', eq: 90 }
        ]
      }
    },
    { id: 'e8', from: 'n8', to: 'n9', kind: 'real', bidirectional: true },
    {
      id: 'e9',
      from: 'n3',
      to: 'n1',
      kind: 'conditional',
      bidirectional: true,
      when: { all: [{ ref: 'crownRotate', eq: 0 }] }
    }
  ],
  interactables: [
    {
      id: 'crownRotate',
      displayName: '冠轮校准',
      type: 'rotate',
      remote: true,
      anchorId: 'aCrown',
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
    },
    {
      id: 'bridgeSlide',
      displayName: '主桥滑轨',
      type: 'slide',
      remote: true,
      anchorId: 'aBridge',
      initialValue: 'left',
      states: [
        { value: 'left', durationMs: 460, label: '左位' },
        { value: 'center', durationMs: 460, label: '中位' },
        { value: 'right', durationMs: 460, label: '右位' }
      ],
      effects: {
        left: { positionOffset: [-1.3, 0, 0] },
        center: { positionOffset: [0, 0, 0] },
        right: { positionOffset: [1.3, 0, 0] }
      }
    },
    {
      id: 'bridgeLift',
      displayName: '主桥升降',
      type: 'lift',
      remote: true,
      anchorId: 'aBridge',
      initialValue: 'down',
      states: [
        { value: 'down', durationMs: 520, label: '下沉' },
        { value: 'up', durationMs: 520, label: '抬升' }
      ],
      effects: {
        down: { positionOffset: [0, -1.4, 0] },
        up: { positionOffset: [0, 0, 0] }
      }
    },
    {
      id: 'lensRotate',
      displayName: '透镜环',
      type: 'rotate',
      remote: true,
      anchorId: 'aLens',
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
      id: 'gateShift',
      displayName: '闸门位移',
      type: 'slide',
      remote: true,
      anchorId: 'aGate',
      initialValue: 'near',
      states: [
        { value: 'near', durationMs: 450, label: '近位' },
        { value: 'far', durationMs: 450, label: '远位' }
      ],
      effects: {
        near: { positionOffset: [0, 0, -1.1] },
        far: { positionOffset: [0, 0, 0.9] }
      }
    }
  ]
};
