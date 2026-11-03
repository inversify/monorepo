#!/usr/bin/env node

import { argv } from 'node:process';

import { promisifiedExec } from '../src/promisifiedExec.js';

const TURBOREPO_ROOT_PACKAGE_NAME = '//';
const TURBOREPO_TASK_NOT_FOUND_MAGIC_STRING = '\u003cNONEXISTENT\u003e';

const taskToDryRun = argv[2];
const baseRef = argv[3];

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

console.log(JSON.stringify(packageNames));
