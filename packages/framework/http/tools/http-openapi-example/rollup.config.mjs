import { buildBundleConfig } from '@inversifyjs/foundation-rollup-config';

/** @type {!import("rollup").MergedRollupOptions[]} */
export default buildBundleConfig(
  './src/index.ts',
  './lib/esm',
  undefined,
  false,
);
