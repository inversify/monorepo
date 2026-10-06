#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

import { generateExampleFromSourceCode } from '@inversifyjs/code-examples-devkit';
import { glob } from 'glob';

const SRC_FOLDER: string = './src';
const EXAMPLES_GLOB_PATTERN: string = `${SRC_FOLDER}/examples/**/*.{mts,ts}`;
const PROTO_GLOB_PATTERN: string = `${SRC_FOLDER}/examples/**/*.proto`;
const TEST_EXAMPLES_GLOB_PATTERN: string = `${SRC_FOLDER}/examples/**/*.spec.{mts,ts}`;

async function getExamplePaths(): Promise<string[]> {
  return glob(EXAMPLES_GLOB_PATTERN, {
    ignore: [
      TEST_EXAMPLES_GLOB_PATTERN,
      `${SRC_FOLDER}/examples/**/generated/**`,
    ],
  });
}

async function getProtoPaths(): Promise<string[]> {
  return glob(PROTO_GLOB_PATTERN);
}

async function run(): Promise<void> {
  const codeExamplePaths: string[] = await getExamplePaths();

  for (const codeExamplePath of codeExamplePaths) {
    await writeSourceCodeExample(
      `${codeExamplePath.replace('src', 'generated')}.txt`,
      await generateExampleFromSourceCode(codeExamplePath),
    );
  }

  const protoPaths: string[] = await getProtoPaths();

  for (const protoPath of protoPaths) {
    await writeSourceCodeExample(
      `${protoPath.replace('src', 'generated')}.txt`,
      await fs.readFile(protoPath, 'utf8'),
    );
  }
}

async function writeSourceCodeExample(
  destinationPath: string,
  sourceContent: string,
): Promise<void> {
  const directory: string = path.dirname(destinationPath);

  try {
    await fs.stat(directory);
  } catch (_error: unknown) {
    await fs.mkdir(directory, { recursive: true });
  }

  await fs.writeFile(destinationPath, sourceContent);
}

await run();
