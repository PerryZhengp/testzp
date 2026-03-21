import { evaluateCondition } from '../../src/gameplay/validation/condition-evaluator';

describe('evaluateCondition', () => {
  it('returns true when no condition is provided', () => {
    expect(evaluateCondition(undefined, { a: 1 })).toBe(true);
  });

  it('evaluates all/any/not correctly', () => {
    const state = {
      bridge: 'open',
      tower: 90,
      blocked: false
    };

    expect(
      evaluateCondition(
        {
          all: [{ ref: 'bridge', eq: 'open' }],
          any: [{ ref: 'tower', eq: 0 }, { ref: 'tower', eq: 90 }],
          not: [{ ref: 'blocked', eq: true }]
        },
        state
      )
    ).toBe(true);
  });

  it('returns false when all condition fails', () => {
    expect(
      evaluateCondition(
        {
          all: [{ ref: 'tower', eq: 180 }]
        },
        { tower: 90 }
      )
    ).toBe(false);
  });
});
