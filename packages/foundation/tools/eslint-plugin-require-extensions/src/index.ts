import type { ESLint, Linter } from 'eslint';

import { requireExtensions, requireIndex } from './rules/requireExtensions.js';

const plugin: ESLint.Plugin = {
  configs: {},
  meta: {
    name: '@inversifyjs/eslint-plugin-require-extensions',
    version: '0.1.0',
  },
  rules: {
    'require-extensions': requireExtensions,
    'require-index': requireIndex,
  },
};

// Add configs after plugin is defined so we can reference the plugin itself
const recommendedConfig: Linter.Config = {
  plugins: {
    'require-extensions': plugin,
  },
  rules: {
    'require-extensions/require-extensions': 'error',
    'require-extensions/require-index': 'error',
  },
};

plugin.configs = {
  recommended: recommendedConfig,
};

export default plugin;
export { requireExtensions, requireIndex };
