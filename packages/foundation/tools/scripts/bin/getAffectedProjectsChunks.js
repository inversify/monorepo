#!/usr/bin/env node

import process from 'node:process';

import { promisifiedExec } from '../src/promisifiedExec.js';

/**
 * @param {Array} elements Elements
 * @param {number} chunks chunks amount
 * @returns {Array.<Array>}
 */
function buildChunks(elements, chunks) {
  const chunkSize = Math.ceil(elements.length / chunks);

  const chunksArray = [];

  for (let i = 0; i < elements.length; i += chunkSize) {
    chunksArray.push(elements.slice(i, i + chunkSize));
  }

  return chunksArray;
}

const TURBOREPO_ROOT_PACKAGE_NAME = '//';
const TURBOREPO_TASK_NOT_FOUND_MAGIC_STRING = '\u003cNONEXISTENT\u003e';

const taskToDryRun = process.argv[2];
const baseRef = process.argv[3];
const chunks = parseInt(process.argv[4]);

let execCommand = `pnpm exec turbo run ${taskToDryRun} --dry=json`;

if (baseRef !== undefined) {
  execCommand += ` --filter ...[${baseRef}]`;
}

const stringifiedDryRun = (await promisifiedExec(execCommand)).trim();

const dryRunResult = JSON.parse(stringifiedDryRun);

/** @type {Array.<string>} */
const dryResultPackageNames = dryRunResult.packages.filter(
  (packageName) => packageName !== TURBOREPO_ROOT_PACKAGE_NAME,
);

const tasks = dryRunResult.tasks.filter((task) =>
  dryResultPackageNames.some(
    (packageName) =>
      task.taskId === `${packageName}#${taskToDryRun}` &&
      !task.command.includes(TURBOREPO_TASK_NOT_FOUND_MAGIC_STRING),
  ),
);

/** @type {Array.<string>} */
const packageNames = tasks.map((task) => task.package);

const packageNameChunks = buildChunks(packageNames, chunks).filter(
  (chunk) => chunk.length > 0,
);

process.stdout.write(JSON.stringify(packageNameChunks));
