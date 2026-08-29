import { buildConfig } from '@inversifyjs/foundation-vitest-config';
import { vitePlugin as rflctPlugin } from 'rflct/vite';

const config = buildConfig([rflctPlugin()]);

export default {
  ...config,
  test: {
    ...config.test,
    execArgv: [...(config.test.execArgv ?? []), '--expose-gc'],
    projects: config.test.projects.map((project) => ({
      ...project,
      test: {
        ...project.test,
        execArgv: [...(project.test.execArgv ?? []), '--expose-gc'],
      },
    })),
  },
};
