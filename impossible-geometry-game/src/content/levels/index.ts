import type { LevelDef } from '../../shared/types/game';
import { level1 } from './level-1';
import { level2 } from './level-2';
import { level3 } from './level-3';

export const orderedLevels: LevelDef[] = [level1, level2, level3];

export const levelsById: Record<string, LevelDef> = Object.fromEntries(
  orderedLevels.map((level) => [level.id, level])
);
