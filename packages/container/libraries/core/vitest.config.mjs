import { defaultConfig } from '@inversifyjs/foundation-vitest-config';

export default {
  ...defaultConfig,
  test: {
    ...defaultConfig.test,
    execArgv: [...(defaultConfig.execArgv ?? []), '--expose-gc'],
    projects: defaultConfig.test.projects.map((project) => ({
      ...project,
      test: {
        ...project.test,
        execArgv: [...(project.test.execArgv ?? []), '--expose-gc'],
      },
    })),
  },
};
