import { defaultConfig } from '@inversifyjs/foundation-vitest-config';
import { vitePlugin as rflctPlugin } from 'rflct/vite';

export default {
  ...defaultConfig,
  plugins: [rflctPlugin()],
  test: {
    ...defaultConfig.test,
    execArgv: [...(defaultConfig.test.execArgv ?? []), '--expose-gc'],
    projects: defaultConfig.test.projects.map((project) => ({
      ...project,
      test: {
        ...project.test,
        execArgv: [...(project.test.execArgv ?? []), '--expose-gc'],
      },
    })),
  },
};
