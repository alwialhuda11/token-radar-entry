// Entry point for the Token Radar hand-in (Node 22, standard library only).
// The sealed snapshot arrives at /input; everything this file needs is either
// there or already committed beside it. Output goes to /output, or to
// MAKEFUN_OUTPUT_DIR when the program is exercised on a workstation.

import {
  copyFileSync, existsSync, mkdirSync, readFileSync,
  readdirSync, statSync, writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { boardIssue, buildRadar, dataScript, parseSnapshot } from './lib/model.ts';
import { buildDossier } from './vendor/makefun-board.ts';

const root = fileURLToPath(new URL('.', import.meta.url));

function option(name, fallback) {
  const at = process.argv.indexOf('--' + name);
  if (at !== -1 && at + 1 < process.argv.length) return process.argv[at + 1];
  const joined = process.argv.find((a) => a.startsWith('--' + name + '='));
  return joined === undefined ? fallback : joined.slice(name.length + 3);
}

const inputDir = option('input', '/input');
const inputPath = inputDir.endsWith('.json') ? inputDir : join(inputDir, 'snapshot.json');
if (!existsSync(inputPath)) {
  process.stderr.write('token radar: snapshot missing at ' + inputPath + '\n');
  process.exit(2);
}
const outputDir = option('output', process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

const snapshot = parseSnapshot(readFileSync(inputPath, 'utf8'));
const built = buildRadar(snapshot);
const problem = boardIssue(built.board, snapshot);
if (problem !== null) {
  process.stderr.write('token radar: gate refuses this board: ' + problem + '\n');
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, 'board.json'), JSON.stringify({ rows: built.board }) + '\n');
writeFileSync(join(outputDir, 'data.js'), dataScript(built.radar));

function copyDirectory(from, to) {
  if (!existsSync(from)) return [];
  mkdirSync(to, { recursive: true });
  const copied = [];
  for (const name of readdirSync(from)) {
    if (name.startsWith('.')) continue;
    const source = join(from, name);
    if (!statSync(source).isFile()) continue;
    copyFileSync(source, join(to, name));
    copied.push(name);
  }
  return copied;
}

copyDirectory(join(root, 'dashboard'), join(outputDir, 'dashboard'));
const captures = copyDirectory(join(root, 'screenshots'), join(outputDir, 'screenshots'));
if (captures.length < 3) {
  process.stderr.write('token radar: at least three captures are required\n');
  process.exit(1);
}

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
process.stderr.write(
  'token radar: ' + snapshot.protocols.length + ' protocols, ' +
  built.board.length + ' rows, ' + captures.length + ' captures\n',
);
