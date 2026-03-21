import type { ChapterDef } from '../../shared/types/game';
import { orderedLevels } from '../levels';

export const chapter1: ChapterDef = {
  id: 'chapter1',
  title: '第一章：浮空观象台',
  levelIds: orderedLevels.map((level) => level.id)
};
