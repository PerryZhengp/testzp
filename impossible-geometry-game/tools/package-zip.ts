import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createContextSnapshot } from './context-snapshot';

function timestampLabel(date: Date): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  return `${yyyy}${mm}${dd}-${hh}${min}`;
}

function main(): void {
  const scriptDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
  const rootDir = resolve(scriptDir, '..');
  const distDir = resolve(rootDir, 'dist');
  mkdirSync(distDir, { recursive: true });

  const paths = createContextSnapshot();
  console.log(`Snapshot ready: ${paths.jsonPath}`);

  const zipName = `impossible-geometry-game-${timestampLabel(new Date())}.zip`;
  const zipPath = resolve(distDir, zipName);

  const command = [
    `zip -r "${zipPath}" .`,
    '-x "node_modules/*"',
    '-x "dist/*"',
    '-x ".git/*"',
    '-x ".DS_Store"',
    '-x "playwright-report/*"',
    '-x "test-results/*"'
  ].join(' ');

  execSync(command, { cwd: rootDir, stdio: 'inherit' });
  console.log(`Package created at: ${zipPath}`);
}

main();
