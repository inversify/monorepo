import baseConfig from '@inversifyjs/foundation-oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [baseConfig],
  ignorePatterns: ['prisma.config.ts', 'src/generated/**'],
});
