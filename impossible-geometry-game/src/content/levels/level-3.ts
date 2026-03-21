import type { LevelDef } from '../../shared/types/game';

export const level3: LevelDef = {
  id: 'chapter1-level3',
  title: 'L3 · Sliding Mirage',
  chapterId: 'chapter1',
  description: 'Slide and lift the bridge, then align an illusory path.',
  hint: 'Green moves horizontally, blue moves vertically, orange finalizes the mirage.',
  spawnNodeId: 'n0',
  goalNodeId: 'n4',
  camera: {
    zoom: 8.4,
    yawDeg: 45,
    pitchDeg: 36,
    target: [4.8, 0, 0]
  },
  anchors: [
    { id: 'aStart', basePosition: [0, 0, 0] },
    { id: 'aBridge', basePosition: [4, 0, -1.1] },
    { id: 'aGoal', basePosition: [7.2, 0, 1.2] }
  ],
  nodes: [
    { id: 'n0', anchorId: 'aStart', localPosition: [0, 0, 0] },
    { id: 'n1', anchorId: 'aStart', localPosition: [2, 0, 0] },
    { id: 'n2', anchorId: 'aBridge', localPosition: [0, 0, 0] },
    { id: 'n3', anchorId: 'aGoal', localPosition: [0, 0, 0] },
    { id: 'n4', anchorId: 'aGoal', localPosition: [2, 0, 0] }
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
    {
      id: 'e2',
      from: 'n2',
      to: 'n3',
      kind: 'illusory',
      bidirectional: true,
      thresholdNdc: 2,
      when: {
        all: [
          { ref: 'slideBridge', eq: 'center' },
          { ref: 'liftBridge', eq: 'up' },
          { ref: 'rotateGoal', eq: 90 }
        ]
      }
    },
    { id: 'e3', from: 'n3', to: 'n4', kind: 'real', bidirectional: true }
  ],
  interactables: [
    {
      id: 'slideBridge',
      displayName: 'Bridge Slider',
      type: 'slide',
      remote: true,
      anchorId: 'aBridge',
      initialValue: 'left',
      states: [
        { value: 'left', durationMs: 460, label: 'Left' },
        { value: 'center', durationMs: 460, label: 'Center' },
        { value: 'right', durationMs: 460, label: 'Right' }
      ],
      effects: {
        left: { positionOffset: [-1.5, 0, 0] },
        center: { positionOffset: [0, 0, 0] },
        right: { positionOffset: [1.5, 0, 0] }
      }
    },
    {
      id: 'liftBridge',
      displayName: 'Bridge Lift',
      type: 'lift',
      remote: true,
      anchorId: 'aBridge',
      initialValue: 'down',
      states: [
        { value: 'down', durationMs: 540, label: 'Down' },
        { value: 'up', durationMs: 540, label: 'Up' }
      ],
      effects: {
        down: { positionOffset: [0, -1.6, 0] },
        up: { positionOffset: [0, 0, 0] }
      }
    },
    {
      id: 'rotateGoal',
      displayName: 'Mirage Dial',
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
