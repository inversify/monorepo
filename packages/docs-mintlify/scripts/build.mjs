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
  const favicon = typeof docs.favicon === 'string' ? docs.favicon : '/favicon.ico';
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

const docs = loadDocsConfig();
assertFavicon(docs);
assertPagesExist(docs);
console.log('mintlify docs build checks passed');
