#!/usr/bin/env node

import fs from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { argv } from 'node:process';

/**
 * @param {string} path
 * @returns {Promise<boolean>}
 */
async function pathExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch (_err) {
    return false;
  }
}

const directory = argv[2];

if (directory === undefined) {
  throw new Error('Expected a path');
}

const directoryExists = await pathExists(directory);

if (!directoryExists) {
  throw new Error(`Path ${directory} not found`);
}

const filePath = path.join(directory, 'package.json');

const packageJsonFileContent = JSON.stringify(
  {
    type: 'commonjs',
  },
  undefined,
  2,
);

await writeFile(filePath, packageJsonFileContent);
