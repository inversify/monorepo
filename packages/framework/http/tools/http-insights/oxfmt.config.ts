import baseConfig from '@inversifyjs/foundation-oxfmt-config';
import { defineConfig } from 'oxfmt';

export default defineConfig({
  ...baseConfig,
  ignorePatterns: ['src/generated/**'],
});
