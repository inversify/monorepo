import fs from 'node:fs/promises';

import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';

import pathExists from './utils/pathExists.js';

const PACKAGE_JSON_PATH = './package.json';

if (!pathExists(PACKAGE_JSON_PATH)) {
  throw new Error(`Expected "${PACKAGE_JSON_PATH}" path to exist`);
}

const packageJsonObject = JSON.parse(await fs.readFile(PACKAGE_JSON_PATH));
const packageDependencies = Object.keys(packageJsonObject.dependencies ?? {});

/** @type {!import("rollup").MergedRollupOptions[]} */
export default [
  {
    input: './src/index.ts',
    external: packageDependencies,
    output: [
      {
        dir: './lib/esm',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [typescript(), terser()],
  },
  {
    input: 'lib/esm/index.d.ts',
    output: [{ file: 'lib/esm/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];
