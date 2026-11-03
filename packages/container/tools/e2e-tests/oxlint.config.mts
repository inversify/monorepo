import baseConfig from '@inversifyjs/foundation-oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [baseConfig],
  rules: {
    'require-extensions/require-extensions': 'off',
    'require-extensions/require-index': 'off',
  },
});
