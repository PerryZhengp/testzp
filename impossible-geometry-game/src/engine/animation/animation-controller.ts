interface ActiveAnimation {
  durationMs: number;
  elapsedMs: number;
  onUpdate: (t: number) => void;
  onComplete?: () => void;
}

export class AnimationController {
  private animations: ActiveAnimation[] = [];

  animate(durationMs: number, onUpdate: (t: number) => void, onComplete?: () => void): void {
    this.animations.push({
      durationMs: Math.max(1, durationMs),
      elapsedMs: 0,
      onUpdate,
      onComplete
    });
  }

  update(deltaMs: number): void {
    this.animations = this.animations.filter((animation) => {
      animation.elapsedMs += deltaMs;
      const t = Math.min(1, animation.elapsedMs / animation.durationMs);
      animation.onUpdate(t);
      if (t >= 1) {
        animation.onComplete?.();
        return false;
      }

      return true;
    });
  }
}
