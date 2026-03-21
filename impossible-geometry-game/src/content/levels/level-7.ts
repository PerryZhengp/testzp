import type { LevelDef } from '../../shared/types/game';

export const level7: LevelDef = {
  id: 'chapter1-level7',
  title: '第七关·逆向校准',
  chapterId: 'chapter1',
  description: '先用右位进入内环，再在途中改回中位，完成双端同步。',
  hint: '这关要边走边改状态：先右位进场，到内环后切中位。',
  spawnNodeId: 'n0',
  goalNodeId: 'n7',
  camera: {
    zoom: 9.8,
    yawDeg: 49,
    pitchDeg: 38,
    target: [7.4, 0, 0.3]
  },
  anchors: [
    { id: 'aStart', basePosition: [0, 0, 0] },
    { id: 'aWest', basePosition: [3.1, 0, -1.2] },
    { id: 'aCore', basePosition: [5.7, 0, 0] },
    { id: 'aMirror', basePosition: [8.1, 0, 1.1] },
    { id: 'aEast', basePosition: [10.4, 0, 0] },
    { id: 'aGoal', basePosition: [12.8, 0, 0.9] }
  ],
  nodes: [
    { id: 'n0', anchorId: 'aStart', localPosition: [0, 0, 0] },
    { id: 'n1', anchorId: 'aStart', localPosition: [1.8, 0, 0] },
    { id: 'n2', anchorId: 'aWest', localPosition: [0, 0, 0] },
    { id: 'n3', anchorId: 'aCore', localPosition: [0, 0, 0] },
    { id: 'n4', anchorId: 'aMirror', localPosition: [0, 0, 0] },
    { id: 'n5', anchorId: 'aEast', localPosition: [0, 0, 0] },
    { id: 'n6', anchorId: 'aGoal', localPosition: [0, 0, 0] },
    { id: 'n7', anchorId: 'aGoal', localPosition: [1.8, 0, 0] }
  ],
  edges: [
    { id: 'e0', from: 'n0', to: 'n1', kind: 'real', bidirectional: true },
    {
      id: 'e1',
      from: 'n1',
      to: 'n2',
      kind: 'conditional',
      bidirectional: true,
      when: { all: [{ ref: 'slideCore', eq: 'right' }] }
    },
    {
      id: 'e2',
      from: 'n2',
      to: 'n3',
      kind: 'conditional',
      bidirectional: true,
      when: { all: [{ ref: 'dialWest', eq: 90 }] }
    },
    {
      id: 'e3',
      from: 'n3',
      to: 'n4',
      kind: 'conditional',
      bidirectional: true,
      when: { all: [{ ref: 'liftCore', eq: 'up' }] }
    },
    {
      id: 'e4',
      from: 'n4',
      to: 'n5',
      kind: 'conditional',
      bidirectional: true,
      when: { all: [{ ref: 'slideCore', eq: 'center' }] }
    },
    {
      id: 'e5',
      from: 'n5',
      to: 'n6',
      kind: 'illusory',
      bidirectional: true,
      thresholdNdc: 0.6,
      when: {
        all: [
          { ref: 'dialEast', eq: 90 },
          { ref: 'mirrorLock', eq: 'on' },
          { ref: 'slideCore', eq: 'center' }
        ]
      }
    },
    {
      id: 'e6',
      from: 'n6',
      to: 'n7',
      kind: 'conditional',
      bidirectional: true,
      when: {
        all: [
          { ref: 'dialWest', eq: 90 },
          { ref: 'dialEast', eq: 90 },
          { ref: 'liftCore', eq: 'up' }
        ]
      }
    },
    {
      id: 'e7',
      from: 'n3',
      to: 'n1',
      kind: 'conditional',
      bidirectional: true,
      when: { all: [{ ref: 'slideCore', eq: 'left' }] }
    }
  ],
  interactables: [
    {
      id: 'dialWest',
      displayName: '西端旋钮',
      type: 'rotate',
      remote: true,
      anchorId: 'aWest',
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
      id: 'dialEast',
      displayName: '东端旋钮',
      type: 'rotate',
      remote: true,
      anchorId: 'aEast',
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
      id: 'slideCore',
      displayName: '核心滑轨',
      type: 'slide',
      remote: true,
      anchorId: 'aCore',
      initialValue: 'left',
      states: [
        { value: 'left', durationMs: 450, label: '左位' },
        { value: 'center', durationMs: 450, label: '中位' },
        { value: 'right', durationMs: 450, label: '右位' }
      ],
      effects: {
        left: { positionOffset: [-1.2, 0, 0] },
        center: { positionOffset: [0, 0, 0] },
        right: { positionOffset: [1.2, 0, 0] }
      }
    },
    {
      id: 'liftCore',
      displayName: '核心升降',
      type: 'lift',
      remote: true,
      anchorId: 'aCore',
      initialValue: 'down',
      states: [
        { value: 'down', durationMs: 520, label: '下沉' },
        { value: 'up', durationMs: 520, label: '抬升' }
      ],
      effects: {
        down: { positionOffset: [0, -1.2, 0] },
        up: { positionOffset: [0, 0, 0] }
      }
    },
    {
      id: 'mirrorLock',
      displayName: '镜面锁相',
      type: 'rotate',
      remote: true,
      anchorId: 'aMirror',
      initialValue: 'off',
      states: [
        { value: 'off', durationMs: 500, label: '关闭' },
        { value: 'on', durationMs: 500, label: '开启' }
      ],
      effects: {
        off: { rotationDeg: [0, 0, 0] },
        on: { rotationDeg: [0, 90, 0] }
      }
    }
  ]
};
