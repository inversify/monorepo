import { existsSync, rmSync, mkdirSync, cpSync, readdirSync, renameSync, statSync } from 'node:fs';
import { dirname, join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'snippets', 'code-examples');
const target = join(root, '../../../docs/tools/inversify-code-examples/generated');

if (!existsSync(target)) {
  console.error(`Missing code examples at ${target}. Build @inversifyjs/code-examples first.`);
  process.exit(1);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(target, outDir, { recursive: true });

function renameTsTxt(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      renameTsTxt(full);
      continue;
    }
    if (entry.endsWith('.ts.txt')) {
      renameSync(full, join(dir, entry.slice(0, -4))); // drop .txt
    }
  }
}
renameTsTxt(outDir);
console.log(`Copied and normalized code examples into ${outDir}`);
