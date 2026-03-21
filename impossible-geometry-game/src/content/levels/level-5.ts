import type { LevelDef } from '../../shared/types/game';

export const level5: LevelDef = {
  id: 'chapter1-level5',
  title: '第五关·错层回廊',
  chapterId: 'chapter1',
  description: '四组机关交错生效，需要一次完成高差与朝向校准。',
  hint: '两段升降都要在高位，滑轨保持中位，闸门最后旋到 90°。',
  spawnNodeId: 'n0',
  goalNodeId: 'n7',
  camera: {
    zoom: 9.4,
    yawDeg: 48,
    pitchDeg: 37,
    target: [7.1, 0, 0.3]
  },
  anchors: [
    { id: 'aStart', basePosition: [0, 0, 0] },
    { id: 'aA', basePosition: [3.4, 0, -1.2] },
    { id: 'aCorridor', basePosition: [6.2, 0, -0.1] },
    { id: 'aB', basePosition: [8.8, 0, 1.2] },
    { id: 'aGate', basePosition: [11.1, 0, 0.2] },
    { id: 'aGoal', basePosition: [13.4, 0, 0.8] }
  ],
  nodes: [
    { id: 'n0', anchorId: 'aStart', localPosition: [0, 0, 0] },
    { id: 'n1', anchorId: 'aStart', localPosition: [2, 0, 0] },
    { id: 'n2', anchorId: 'aA', localPosition: [0, 0, 0] },
    { id: 'n3', anchorId: 'aCorridor', localPosition: [0, 0, 0] },
    { id: 'n4', anchorId: 'aB', localPosition: [0, 0, 0] },
    { id: 'n5', anchorId: 'aGate', localPosition: [0, 0, 0] },
    { id: 'n6', anchorId: 'aGoal', localPosition: [0, 0, 0] },
    { id: 'n7', anchorId: 'aGoal', localPosition: [1.9, 0, 0] }
  ],
  edges: [
    { id: 'e0', from: 'n0', to: 'n1', kind: 'real', bidirectional: true },
    {
      id: 'e1',
      from: 'n1',
      to: 'n2',
      kind: 'conditional',
      bidirectional: true,
      when: { all: [{ ref: 'liftA', eq: 'up' }] }
    },
    {
      id: 'e2',
      from: 'n2',
      to: 'n3',
      kind: 'conditional',
      bidirectional: true,
      when: { all: [{ ref: 'slideA', eq: 'mid' }] }
    },
    {
      id: 'e3',
      from: 'n3',
      to: 'n4',
      kind: 'conditional',
      bidirectional: true,
      when: { all: [{ ref: 'liftB', eq: 'up' }] }
    },
    {
      id: 'e4',
      from: 'n4',
      to: 'n5',
      kind: 'conditional',
      bidirectional: true,
      when: { all: [{ ref: 'rotateGate', eq: 90 }] }
    },
    {
      id: 'e5',
      from: 'n5',
      to: 'n6',
      kind: 'illusory',
      bidirectional: true,
      thresholdNdc: 0.64,
      when: {
        all: [
          { ref: 'liftA', eq: 'up' },
          { ref: 'slideA', eq: 'mid' },
          { ref: 'liftB', eq: 'up' },
          { ref: 'rotateGate', eq: 90 }
        ]
      }
    },
    { id: 'e6', from: 'n6', to: 'n7', kind: 'real', bidirectional: true },
    {
      id: 'e7',
      from: 'n3',
      to: 'n1',
      kind: 'conditional',
      bidirectional: true,
      when: { all: [{ ref: 'slideA', eq: 'rear' }] }
    },
    {
      id: 'e8',
      from: 'n4',
      to: 'n2',
      kind: 'conditional',
      bidirectional: true,
      when: { all: [{ ref: 'slideA', eq: 'front' }] }
    }
  ],
  interactables: [
    {
      id: 'liftA',
      displayName: '前段升降',
      type: 'lift',
      remote: true,
      anchorId: 'aA',
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
      id: 'slideA',
      displayName: '中段滑轨',
      type: 'slide',
      remote: true,
      anchorId: 'aCorridor',
      initialValue: 'rear',
      states: [
        { value: 'rear', durationMs: 450, label: '后位' },
        { value: 'mid', durationMs: 450, label: '中位' },
        { value: 'front', durationMs: 450, label: '前位' }
      ],
      effects: {
        rear: { positionOffset: [-1.2, 0, 0] },
        mid: { positionOffset: [0, 0, 0] },
        front: { positionOffset: [1.2, 0, 0] }
      }
    },
    {
      id: 'liftB',
      displayName: '后段升降',
      type: 'lift',
      remote: true,
      anchorId: 'aB',
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
      id: 'rotateGate',
      displayName: '闸门校准',
      type: 'rotate',
      remote: true,
      anchorId: 'aGate',
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
