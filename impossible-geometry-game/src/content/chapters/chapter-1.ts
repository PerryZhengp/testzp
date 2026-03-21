import type { ChapterDef } from '../../shared/types/game';
import { orderedLevels } from '../levels';

export const chapter1: ChapterDef = {
  id: 'chapter1',
  title: 'Chapter I: Floating Observatory',
  levelIds: orderedLevels.map((level) => level.id)
};
