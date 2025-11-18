import fs from 'node:fs/promises';
import path from 'node:path';

import multi from '@rollup/plugin-multi-entry';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';

import pathExists from './utils/pathExists.js';

const NODE_REGEX = /^node:/;

const PACKAGE_JSON_PATH = './package.json';

if (!pathExists(PACKAGE_JSON_PATH)) {
  throw new Error(`Expected "${PACKAGE_JSON_PATH}" path to exist`);
}

const packageJsonObject = JSON.parse(await fs.readFile(PACKAGE_JSON_PATH));
const packageDependencies = Object.keys(packageJsonObject.dependencies ?? {});
const packagePeerDependencies = Object.keys(
  packageJsonObject.peerDependencies ?? {},
);

/**
 * @param { !string } inputFile
 * @param { !string } outputDir
 * @param { ?string } declarationFile
 * @param { ?boolean } terse
 * @returns {!import("rollup").MergedRollupOptions[]}
 */
export function buildBundleConfig(
  inputFile,
  outputDir,
  declarationFile,
  terse,
) {
  const filePath = path.parse(inputFile);

  const declarationFilePath =
    declarationFile ??
    path.join(outputDir, `${filePath.name}.d${filePath.ext}`);

  const applyTerser = terse ?? true;

  const plugins = [
    typescript({
      tsconfig: './tsconfig.esm.json',
    }),
  ];

  if (applyTerser) {
    plugins.push(terser());
  }

  return [
    {
      input: inputFile,
      external: [
        NODE_REGEX,
        ...packageDependencies,
        ...packagePeerDependencies,
      ],
      output: [
        {
          dir: outputDir,
          format: 'esm',
          sourcemap: true,
          sourcemapPathTransform: (relativeSourcePath) => {
            // Rollup seems to generate source maps pointing to the wrong directory. Ugly patch to fix it
            if (relativeSourcePath.startsWith('../')) {
              return relativeSourcePath.slice(3);
            } else {
              return relativeSourcePath;
            }
          },
        },
      ],
      plugins,
    },
    {
      external: [
        NODE_REGEX,
        ...packageDependencies,
        ...packagePeerDependencies,
      ],
      input: declarationFilePath,
      output: [{ file: declarationFilePath, format: 'es' }],
      plugins: [
        dts({
          tsconfig: './tsconfig.esm.json',
        }),
      ],
    },
  ];
}

/**
 * @param { !string } input
 * @param { !string } output
 * @returns {!import("rollup").MergedRollupOptions[]}
 */
export function buildMultiBundleConfig(inputFiles, outputDir) {
  const filePath = path.parse(inputFiles);

  const declarationFilePath = path.join(
    outputDir,
    `${filePath.name}.d${filePath.ext}`,
  );

  return [
    {
      input: inputFiles,
      external: [
        NODE_REGEX,
        ...packageDependencies,
        ...packagePeerDependencies,
      ],
      output: [
        {
          dir: outputDir,
          format: 'esm',
          sourcemap: true,
          sourcemapPathTransform: (relativeSourcePath) => {
            // Rollup seems to generate source maps pointing to the wrong directory. Ugly patch to fix it
            if (relativeSourcePath.startsWith('../')) {
              return relativeSourcePath.slice(3);
            } else {
              return relativeSourcePath;
            }
          },
        },
      ],
      plugins: [
        multi(),
        typescript({
          tsconfig: './tsconfig.esm.json',
        }),
        terser(),
      ],
    },
    {
      external: [
        NODE_REGEX,
        ...packageDependencies,
        ...packagePeerDependencies,
      ],
      input: declarationFilePath,
      output: [{ file: declarationFilePath, format: 'es' }],
      plugins: [
        dts({
          tsconfig: './tsconfig.esm.json',
        }),
        multi(),
      ],
    },
  ];
}

/** @type {!import("rollup").MergedRollupOptions[]} */
export default buildBundleConfig('./src/index.ts', './lib/esm');
