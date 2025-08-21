import { buildBundleConfig } from '@inversifyjs/foundation-rollup-config';

/** @type {!import("rollup").MergedRollupOptions[]} */
export default buildBundleConfig(
  './src/jsonSchema/202012/index.ts',
  './lib/esm',
  './lib/esm/jsonSchema/202012/index.d.ts',
);
