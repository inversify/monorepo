#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

import { generateExampleFromSourceCode } from '@inversifyjs/code-examples-devkit';
import { glob } from 'glob';

const SRC_FOLDER: string = './src';
const EXAMPLES_GLOB_PATTERN: string = `${SRC_FOLDER}/examples/**/*.ts`;
const TEST_EXAMPLES_GLOB_PATTERN: string = `${SRC_FOLDER}/examples/**/*.spec.ts`;

async function getExamplePaths(): Promise<string[]> {
  return glob(EXAMPLES_GLOB_PATTERN, { ignore: TEST_EXAMPLES_GLOB_PATTERN });
}

async function run(): Promise<void> {
  const codeExamplePaths: string[] = await getExamplePaths();

  for (const codeExamplePath of codeExamplePaths) {
    await writeSourceCodeExample(
      codeExamplePath,
      await generateExampleFromSourceCode(codeExamplePath),
    );
  }
}

async function writeSourceCodeExample(
  sourcePath: string,
  sourceContent: string,
): Promise<void> {
  const destinationPath: string = `${sourcePath.replace('src', 'generated')}.txt`;

  const directory: string = path.dirname(destinationPath);

  try {
    await fs.stat(directory);
  } catch (_error: unknown) {
    await fs.mkdir(directory, { recursive: true });
  }

  await fs.writeFile(destinationPath, sourceContent);
}

await run();
