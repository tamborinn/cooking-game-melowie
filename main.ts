// Package the static, offline Bara dan Rempah game and its Make.fun dossier.
// Run `node main.ts`; MAKEFUN_OUTPUT_DIR can point at a local output directory.

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const sourceGame = join(here, 'game');
const sourceScreenshots = join(here, 'screenshots');

if (!existsSync(join(sourceGame, 'index.html'))) {
  throw new Error(`Cannot package Bara dan Rempah: missing ${join(sourceGame, 'index.html')}`);
}
if (!existsSync(sourceScreenshots)) {
  throw new Error(`Cannot package Bara dan Rempah: missing screenshots folder ${sourceScreenshots}`);
}

mkdirSync(out, { recursive: true });
cpSync(sourceGame, join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(sourceScreenshots, join(out, 'screenshots'), { recursive: true });

function countFiles(directory) {
  let count = 0;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) count += countFiles(entryPath);
    else if (entry.isFile()) count += 1;
  }
  return count;
}

const outputGame = join(out, 'game');
const outputScreenshots = join(out, 'screenshots');
if (!existsSync(join(outputGame, 'index.html'))) {
  throw new Error(`Cannot package Bara dan Rempah: copied game is missing ${join(outputGame, 'index.html')}`);
}
if (!existsSync(outputScreenshots)) {
  throw new Error(`Cannot package Bara dan Rempah: copied screenshots folder is missing ${outputScreenshots}`);
}
console.log(`Bara dan Rempah: ${countFiles(outputGame)} file game disalin ke ${outputGame}.`);

// The scorer's caps: at most 4 screenshots of 256 KiB, 993 game files, 48 MiB total,
// and paths below game/ no longer than 1000 bytes. buildDossier performs these checks.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
