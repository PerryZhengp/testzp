import { clamp } from '../../shared/utils/math';

export interface AudioLevels {
  master: number;
  sfx: number;
}

export class AudioService {
  private context?: AudioContext;

  private levels: AudioLevels = {
    master: 0.8,
    sfx: 0.8
  };

  setLevels(levels: AudioLevels): void {
    this.levels = {
      master: clamp(levels.master, 0, 1),
      sfx: clamp(levels.sfx, 0, 1)
    };
  }

  ping(type: 'ok' | 'error' | 'goal' | 'click'): void {
    if (this.levels.master <= 0 || this.levels.sfx <= 0) {
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx) {
      return;
    }

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    const now = ctx.currentTime;
    const base =
      type === 'goal' ? 660 : type === 'ok' ? 520 : type === 'click' ? 460 : 220;

    oscillator.type = type === 'goal' ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(base, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05 * this.levels.master * this.levels.sfx, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.18);
  }

  private ensureContext(): AudioContext | undefined {
    if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') {
      return undefined;
    }

    if (!this.context) {
      this.context = new window.AudioContext();
    }

    if (this.context.state === 'suspended') {
      void this.context.resume();
    }

    return this.context;
  }
}
