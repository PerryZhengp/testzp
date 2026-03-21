import type { ConditionDef, Scalar } from '../../shared/types/game';
import type { StateMap } from '../../shared/utils/condition';

function scalarEquals(left: Scalar | undefined, right: Scalar): boolean {
  return left === right;
}

export function evaluateCondition(condition: ConditionDef | undefined, state: StateMap): boolean {
  if (!condition) {
    return true;
  }

  if (condition.all && !condition.all.every((atom) => scalarEquals(state[atom.ref], atom.eq))) {
    return false;
  }

  if (condition.any) {
    if (condition.any.length === 0) {
      return false;
    }

    if (!condition.any.some((atom) => scalarEquals(state[atom.ref], atom.eq))) {
      return false;
    }
  }

  if (condition.not && condition.not.some((atom) => scalarEquals(state[atom.ref], atom.eq))) {
    return false;
  }

  return true;
}
