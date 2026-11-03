import config from '@inversifyjs/foundation-oxfmt-config';
import { defineConfig } from 'oxfmt';

export default defineConfig({
  ...config,
  ignorePatterns: ['src/app/assets/logo.svg'],
});
