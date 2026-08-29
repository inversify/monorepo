import { buildConfig } from '@inversifyjs/foundation-vitest-config';
import { vitePlugin as rflctPlugin } from 'rflct/vite';

export default buildConfig([rflctPlugin()]);
