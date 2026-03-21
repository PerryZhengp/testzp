import type { InteractableStateDef } from '../../shared/types/game';
import { LevelRuntime } from '../level/level-runtime';

export interface InteractionStep {
  interactableId: string;
  toState: InteractableStateDef;
  durationMs: number;
}

export class InteractionSystem {
  constructor(private readonly runtime: LevelRuntime) {}

  createStep(interactableId: string, reducedMotion: boolean): InteractionStep {
    const toState = this.runtime.getNextInteractableState(interactableId);
    return {
      interactableId,
      toState,
      durationMs: Math.max(120, Math.round(toState.durationMs * (reducedMotion ? 0.4 : 1)))
    };
  }

  commit(step: InteractionStep): void {
    this.runtime.setInteractableValue(step.interactableId, step.toState.value);
  }
}
