import type { LevelDef } from '../../shared/types/game';

export const level2: LevelDef = {
  id: 'chapter1-level2',
  title: 'L2 · Turning Tower',
  chapterId: 'chapter1',
  description: 'Rotate the tower to complete the route.',
  hint: 'The orange cube rotates the right tower. Try each state once.',
  spawnNodeId: 'n0',
  goalNodeId: 'n3',
  camera: {
    zoom: 7.5,
    yawDeg: 42,
    pitchDeg: 35,
    target: [3.5, 0, 0]
  },
  anchors: [
    { id: 'a0', basePosition: [0, 0, 0] },
    { id: 'aTower', basePosition: [5, 0, 0] }
  ],
  nodes: [
    { id: 'n0', anchorId: 'a0', localPosition: [0, 0, 0] },
    { id: 'n1', anchorId: 'a0', localPosition: [2, 0, 0] },
    { id: 'n2', anchorId: 'aTower', localPosition: [-1.4, 0, 0] },
    { id: 'n3', anchorId: 'aTower', localPosition: [0.8, 0, 0] }
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
    { id: 'e2', from: 'n2', to: 'n3', kind: 'real', bidirectional: true }
  ],
  interactables: [
    {
      id: 'rotatorA',
      displayName: 'Tower Rotator',
      type: 'rotate',
      remote: true,
      anchorId: 'aTower',
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
