import {
  access,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const snippetsRoot = join(root, 'snippets', 'code-examples');

function fail(message) {
  console.error(`generate:code:examples failed: ${message}`);
  process.exit(1);
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function resolveGeneratedDir() {
  const require = createRequire(import.meta.url);
  let packageJsonPath;

  try {
    packageJsonPath =
      require.resolve('@inversifyjs/code-examples/package.json');
  } catch (error) {
    fail(`unable to resolve @inversifyjs/code-examples: ${error.message}`);
  }

  const generatedDir = join(dirname(packageJsonPath), 'generated');

  if (!(await pathExists(generatedDir))) {
    fail(`generated folder not found at ${generatedDir}`);
  }

  return generatedDir;
}

async function collectTxtFiles(directory, files = []) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      await collectTxtFiles(entryPath, files);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.txt')) {
      files.push(entryPath);
    }
  }

  return files;
}

function toSnippet(content) {
  const code = content.endsWith('\n') ? content : `${content}\n`;
  return `\`\`\` ts\n${code}\`\`\`\n`;
}

async function writeSnippets(generatedDir) {
  await rm(snippetsRoot, { recursive: true, force: true });

  const txtFiles = await collectTxtFiles(generatedDir);

  await Promise.all(
    txtFiles.map(async (txtPath) => {
      const relativePath = relative(generatedDir, txtPath);
      const snippetPath = join(
        snippetsRoot,
        relativePath.replace(/\.txt$/, '.md'),
      );

      await mkdir(dirname(snippetPath), { recursive: true });
      await writeFile(snippetPath, toSnippet(await readFile(txtPath, 'utf8')));
    }),
  );

  console.log(`generated ${txtFiles.length} code example snippet(s)`);
}

const generatedDir = await resolveGeneratedDir();
await writeSnippets(generatedDir);
