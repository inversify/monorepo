import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function fail(message) {
  console.error(`build failed: ${message}`);
  process.exit(1);
}

function loadDocsConfig() {
  const docsJsonPath = join(root, 'docs.json');
  if (!existsSync(docsJsonPath)) {
    fail('docs.json is missing');
  }

  try {
    return JSON.parse(readFileSync(docsJsonPath, 'utf8'));
  } catch (error) {
    fail(`docs.json is invalid JSON: ${error.message}`);
  }
}

function collectPages(node, pages = []) {
  if (typeof node === 'string') {
    // Page paths are either nested (contain "/") or root pages like "index".
    // Ignore language/version/group labels that are not page paths.
    if (node.includes('/') || node === 'index') {
      pages.push(node);
    }
    return pages;
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      collectPages(item, pages);
    }
    return pages;
  }

  if (node && typeof node === 'object') {
    for (const value of Object.values(node)) {
      collectPages(value, pages);
    }
  }

  return pages;
}

function assertFavicon(docs) {
  const favicon =
    typeof docs.favicon === 'string' ? docs.favicon : '/favicon.ico';
  const relativePath = favicon.replace(/^\//, '');
  const faviconPath = join(root, relativePath);
  if (!existsSync(faviconPath)) {
    fail(`favicon not found at ${relativePath}`);
  }
}

function assertPagesExist(docs) {
  const pages = [...new Set(collectPages(docs.navigation))];
  const missing = [];

  for (const page of pages) {
    const mdxPath = join(root, `${page}.mdx`);
    const mdPath = join(root, `${page}.md`);
    if (!existsSync(mdxPath) && !existsSync(mdPath)) {
      missing.push(page);
    }
  }

  if (missing.length > 0) {
    fail(
      `missing ${missing.length} navigation page(s):\n` +
        missing.map((page) => `  - ${page}`).join('\n'),
    );
  }

  console.log(`checked ${pages.length} navigation pages`);
}

function assertGeneratedCodeExamplesAreStaged() {
  if (process.env.CI === undefined || process.env.CI === '') {
    return;
  }

  const result = spawnSync(
    'git',
    [
      'status',
      '--porcelain',
      '--untracked-files=all',
      '--',
      'snippets/code-examples',
    ],
    {
      cwd: root,
      encoding: 'utf8',
    },
  );

  if (result.error !== undefined) {
    fail(`unable to check generated code examples: ${result.error.message}`);
  }

  if (result.status !== 0) {
    fail(
      `unable to check generated code examples: ${result.stderr.trim() || `git exited with ${result.status}`}`,
    );
  }

  const dirty = result.stdout.split('\n').filter((line) => {
    if (line === '') {
      return false;
    }

    // Untracked files are created and not staged.
    if (line.startsWith('??')) {
      return true;
    }

    // Porcelain format is "XY path"; Y is the unstaged status.
    return line.length >= 2 && line[1] !== ' ';
  });

  if (dirty.length > 0) {
    fail(
      `generated code examples have unstaged changes. Run \`pnpm run generate:code:examples\` and commit the result.\n${dirty.join('\n')}`,
    );
  }

  console.log('generated code examples are clean');
}

const docs = loadDocsConfig();
assertFavicon(docs);
assertPagesExist(docs);
assertGeneratedCodeExamplesAreStaged();
console.log('mintlify docs build checks passed');
