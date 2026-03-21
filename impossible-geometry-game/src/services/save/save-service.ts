import type { SaveDataV1 } from '../../shared/types/game';

const SAVE_KEY = 'impossible-geometry-game-save-v1';

function defaultSave(firstLevelId: string): SaveDataV1 {
  return {
    version: 1,
    unlockedLevelIds: [firstLevelId],
    completedLevelIds: [],
    lastPlayedLevelId: firstLevelId,
    settings: {
      language: 'zh-CN',
      masterVolume: 0.8,
      musicVolume: 0.6,
      sfxVolume: 0.8,
      reducedMotion: false
    }
  };
}

function sanitizeList(list: unknown): string[] {
  if (!Array.isArray(list)) {
    return [];
  }

  return list.filter((item): item is string => typeof item === 'string');
}

export class SaveService {
  private firstLevelId: string;

  private cache: SaveDataV1;

  constructor(firstLevelId: string) {
    this.firstLevelId = firstLevelId;
    this.cache = defaultSave(this.firstLevelId);
  }

  load(): SaveDataV1 {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      this.cache = defaultSave(this.firstLevelId);
      return this.cache;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<SaveDataV1>;
      this.cache = {
        version: 1,
        unlockedLevelIds: this.withFirstLevel(sanitizeList(parsed.unlockedLevelIds)),
        completedLevelIds: sanitizeList(parsed.completedLevelIds),
        lastPlayedLevelId:
          typeof parsed.lastPlayedLevelId === 'string' ? parsed.lastPlayedLevelId : this.firstLevelId,
        settings: {
          language: parsed.settings?.language === 'en' ? 'en' : 'zh-CN',
          masterVolume: this.clampNumber(parsed.settings?.masterVolume, 0, 1, 0.8),
          musicVolume: this.clampNumber(parsed.settings?.musicVolume, 0, 1, 0.6),
          sfxVolume: this.clampNumber(parsed.settings?.sfxVolume, 0, 1, 0.8),
          reducedMotion: Boolean(parsed.settings?.reducedMotion)
        }
      };
    } catch {
      this.cache = defaultSave(this.firstLevelId);
    }

    return this.cache;
  }

  get(): SaveDataV1 {
    return this.cache;
  }

  unlockLevel(levelId: string): void {
    if (!this.cache.unlockedLevelIds.includes(levelId)) {
      this.cache.unlockedLevelIds.push(levelId);
    }

    this.persist();
  }

  markCompleted(levelId: string): void {
    if (!this.cache.completedLevelIds.includes(levelId)) {
      this.cache.completedLevelIds.push(levelId);
    }

    this.persist();
  }

  setLastPlayed(levelId: string): void {
    this.cache.lastPlayedLevelId = levelId;
    this.persist();
  }

  updateSettings(patch: Partial<SaveDataV1['settings']>): SaveDataV1['settings'] {
    this.cache.settings = {
      ...this.cache.settings,
      ...patch
    };
    this.persist();
    return this.cache.settings;
  }

  private persist(): void {
    localStorage.setItem(SAVE_KEY, JSON.stringify(this.cache));
  }

  private withFirstLevel(unlocked: string[]): string[] {
    if (unlocked.includes(this.firstLevelId)) {
      return unlocked;
    }

    return [this.firstLevelId, ...unlocked];
  }

  private clampNumber(value: unknown, min: number, max: number, fallback: number): number {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return fallback;
    }

    return Math.min(max, Math.max(min, value));
  }
}
