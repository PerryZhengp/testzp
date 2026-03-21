import type { LevelDef } from '../../shared/types/game';

export const level3: LevelDef = {
  id: 'chapter1-level3',
  title: '第三关·镜桥试炼',
  chapterId: 'chapter1',
  description: '先把桥面拉平，再调准终端角度，激活错视连边。',
  hint: '桥面必须居中且抬升，再把终端旋到 90°。',
  spawnNodeId: 'n0',
  goalNodeId: 'n6',
  camera: {
    zoom: 8.5,
    yawDeg: 46,
    pitchDeg: 36,
    target: [5.4, 0, 0.2]
  },
  anchors: [
    { id: 'aStart', basePosition: [0, 0, 0] },
    { id: 'aBridge', basePosition: [4, 0, -1] },
    { id: 'aPivot', basePosition: [6.2, 0, 0.6] },
    { id: 'aGoal', basePosition: [7.4, 0, 1.1] }
  ],
  nodes: [
    { id: 'n0', anchorId: 'aStart', localPosition: [0, 0, 0] },
    { id: 'n1', anchorId: 'aStart', localPosition: [2, 0, 0] },
    { id: 'n2', anchorId: 'aBridge', localPosition: [0, 0, 0] },
    { id: 'n3', anchorId: 'aBridge', localPosition: [1.8, 0, 0] },
    { id: 'n4', anchorId: 'aPivot', localPosition: [0, 0, 0] },
    { id: 'n5', anchorId: 'aGoal', localPosition: [-0.6, 0, 0] },
    { id: 'n6', anchorId: 'aGoal', localPosition: [1.2, 0, 0] }
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
        all: [
          { ref: 'slideBridge', eq: 'center' },
          { ref: 'liftBridge', eq: 'up' }
        ]
      }
    },
    { id: 'e2', from: 'n2', to: 'n3', kind: 'real', bidirectional: true },
    {
      id: 'e3',
      from: 'n3',
      to: 'n4',
      kind: 'conditional',
      bidirectional: true,
      when: {
        all: [{ ref: 'rotateGoal', eq: 90 }]
      }
    },
    {
      id: 'e4',
      from: 'n4',
      to: 'n5',
      kind: 'illusory',
      bidirectional: true,
      thresholdNdc: 0.72,
      when: {
        all: [
          { ref: 'slideBridge', eq: 'center' },
          { ref: 'liftBridge', eq: 'up' },
          { ref: 'rotateGoal', eq: 90 }
        ]
      }
    },
    { id: 'e5', from: 'n5', to: 'n6', kind: 'real', bidirectional: true }
  ],
  interactables: [
    {
      id: 'slideBridge',
      displayName: '桥面滑轨',
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
      id: 'liftBridge',
      displayName: '桥面升降',
      type: 'lift',
      remote: true,
      anchorId: 'aBridge',
      initialValue: 'down',
      states: [
        { value: 'down', durationMs: 540, label: '下沉' },
        { value: 'up', durationMs: 540, label: '抬升' }
      ],
      effects: {
        down: { positionOffset: [0, -1.4, 0] },
        up: { positionOffset: [0, 0, 0] }
      }
    },
    {
      id: 'rotateGoal',
      displayName: '终端校准盘',
      type: 'rotate',
      remote: true,
      anchorId: 'aGoal',
      initialValue: 0,
      states: [
        { value: 0, durationMs: 520, label: '0°' },
        { value: 90, durationMs: 520, label: '90°' }
      ],
      effects: {
        '0': { rotationDeg: [0, 0, 0] },
        '90': { rotationDeg: [0, 90, 0] }
      }
    }
  ]
};
