import { buildMultiBundleConfig } from '@inversifyjs/foundation-rollup-config';

/** @type {!import("rollup").MergedRollupOptions[]} */
export default buildMultiBundleConfig('./src/**/*.ts', './lib/esm');
