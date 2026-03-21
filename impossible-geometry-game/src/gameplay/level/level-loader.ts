import type { LevelDef } from '../../shared/types/game';
import { levelsById } from '../../content/levels';

export class LevelLoader {
  getLevel(levelId: string): LevelDef {
    const level = levelsById[levelId];
    if (!level) {
      throw new Error(`Unknown level: ${levelId}`);
    }

    return level;
  }
}
