import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

const outputDir = './lib/esm';

/** @type {!import("rollup").MergedRollupOptions[]} */
export default [
  {
    input: './src/inversifyBundle.ts',
    output: [
      {
        dir: outputDir,
        format: 'esm',
        sourcemap: false,
      },
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.esm.json',
      }),
      nodeResolve(),
      terser(),
    ],
  },
];
