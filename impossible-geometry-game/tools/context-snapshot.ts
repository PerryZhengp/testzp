import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { LevelDef } from '../src/shared/types/game';
import { orderedLevels } from '../src/content/levels';

interface ContextSnapshot {
  createdAt: string;
  summary: {
    chapterCount: number;
    levelCount: number;
    interactableCount: number;
  };
  levels: Array<{
    id: string;
    title: string;
    mechanics: string[];
    spawnNodeId: string;
    goalNodeId: string;
  }>;
  publicInterfaces: string[];
  notes: string[];
}

function normalizeMechanic(type: string): string {
  if (type === 'rotate') {
    return 'rotate';
  }

  if (type === 'slide') {
    return 'slide';
  }

  if (type === 'lift') {
    return 'lift';
  }

  return 'unknown';
}

export function createContextSnapshot(): { jsonPath: string; markdownPath: string } {
  const scriptDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
  const rootDir = resolve(scriptDir, '..');
  const outDir = resolve(rootDir, 'docs/context');
  mkdirSync(outDir, { recursive: true });

  const interactableCount = orderedLevels.reduce(
    (sum: number, level: LevelDef) => sum + level.interactables.length,
    0
  );

  const snapshot: ContextSnapshot = {
    createdAt: new Date().toISOString(),
    summary: {
      chapterCount: 1,
      levelCount: orderedLevels.length,
      interactableCount
    },
    levels: orderedLevels.map((level: LevelDef) => ({
      id: level.id,
      title: level.title,
      mechanics: Array.from(
        new Set(level.interactables.map((item) => normalizeMechanic(item.type)))
      ),
      spawnNodeId: level.spawnNodeId,
      goalNodeId: level.goalNodeId
    })),
    publicInterfaces: [
      'LevelDef (with anchors)',
      'EdgeDef.kind = real | conditional | illusory',
      'SaveDataV1 (versioned save schema)',
      'validate-levels CLI: input level directory, output machine-readable result'
    ],
    notes: [
      'Snapshot is generated before compression so future sessions can recover implementation context.',
      'Use npm run package:zip to snapshot + package in one command.'
    ]
  };

  const jsonPath = join(outDir, 'latest-context.snapshot.json');
  writeFileSync(jsonPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');

  const markdownPath = join(outDir, 'latest-context.snapshot.md');
  const markdown = [
    '# Context Snapshot',
    '',
    `Generated at: ${snapshot.createdAt}`,
    '',
    '## Summary',
    `- Chapters: ${snapshot.summary.chapterCount}`,
    `- Levels: ${snapshot.summary.levelCount}`,
    `- Interactables: ${snapshot.summary.interactableCount}`,
    '',
    '## Levels',
    ...snapshot.levels.map(
      (level) =>
        `- ${level.id}: ${level.title} | mechanics=${level.mechanics.join(', ') || 'none'} | ${level.spawnNodeId} -> ${level.goalNodeId}`
    ),
    '',
    '## Public Interfaces',
    ...snapshot.publicInterfaces.map((item) => `- ${item}`),
    '',
    '## Notes',
    ...snapshot.notes.map((item) => `- ${item}`),
    ''
  ].join('\n');

  writeFileSync(markdownPath, markdown, 'utf8');

  return { jsonPath, markdownPath };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const paths = createContextSnapshot();
  console.log(`Context snapshot written to: ${paths.jsonPath}`);
  console.log(`Context summary written to: ${paths.markdownPath}`);
}
