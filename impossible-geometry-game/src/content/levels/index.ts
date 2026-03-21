import type { LevelDef } from '../../shared/types/game';
import { level1 } from './level-1';
import { level2 } from './level-2';
import { level3 } from './level-3';
import { level4 } from './level-4';
import { level5 } from './level-5';
import { level6 } from './level-6';
import { level7 } from './level-7';
import { level8 } from './level-8';

export const orderedLevels: LevelDef[] = [level1, level2, level3, level4, level5, level6, level7, level8];

export const levelsById: Record<string, LevelDef> = Object.fromEntries(
  orderedLevels.map((level) => [level.id, level])
);
