import { promises as fs, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const TARGET_DIR = path.join(__dirname, '..', 'data');
const TARGET_FILE = path.join(TARGET_DIR, 'initials-blocklist.json');

// LDNOOBWV2 (CC0) covers 75 languages. The DiceBear initials style only
// renders 1–2 code points derived from the seed, so longer entries are
// dropped. Latin-only entries are dropped too: 2-letter combinations are
// dominated by legitimate name initials and the public list pulls in
// Mandarin internet slang (e.g. "pk", "bi") that would over-trigger.
//
// Source repo (browseable):
//   https://github.com/LDNOOBWV2/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words_V2/tree/main/data
const SOURCES = ['zh', 'ja', 'ko', 'ar', 'ru'] as const;

// 1–2 codepoints, all letters/marks (matching `Initials.fromSeed`'s
// `\p{L}[\p{L}\p{M}]*` regex), at least one non-ASCII so that legitimate
// Latin name initials like "AB" stay unfiltered.
const CANDIDATE = /^(?=.*\P{ASCII})[\p{L}\p{M}]{1,2}$/u;

async function fetchList(lang: string): Promise<string[]> {
  const url = `https://raw.githubusercontent.com/LDNOOBWV2/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words_V2/main/data/${lang}.txt`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return (await response.text()).split('\n');
}

await fs.mkdir(TARGET_DIR, { recursive: true });

const lists = await Promise.all(SOURCES.map(fetchList)).catch(
  (error: Error): never => {
    // Offline / GitHub flake — keep an existing build artefact so CI and
    // sandboxed builds don't break. A truly first-time build still fails.
    if (!existsSync(TARGET_FILE)) {
      throw error;
    }

    console.warn(
      `Failed to refresh blocklist (${error.message}); keeping existing ${path.relative(process.cwd(), TARGET_FILE)}.`,
    );
    process.exit(0);
  },
);

const entries = new Set<string>();

for (const list of lists) {
  for (const raw of list) {
    const word = raw.trim();

    if (CANDIDATE.test(word)) {
      entries.add(word.toUpperCase());
    }
  }
}

const sorted = [...entries].sort();

await fs.writeFile(TARGET_FILE, JSON.stringify(sorted, null, 2));

console.log(
  `Wrote ${sorted.length} initials to ${path.relative(process.cwd(), TARGET_FILE)} (sources: ${SOURCES.join(', ')})`,
);
