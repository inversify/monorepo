import { buildBundleConfig } from '@inversifyjs/foundation-rollup-config';

/** @type {!import("rollup").MergedRollupOptions[]} */
export default buildBundleConfig(
  './src/openApi/v3Dot1/index.ts',
  './lib/esm',
  './lib/esm/openApi/v3Dot1/index.d.ts',
);
