import { defaultConfig } from '@inversifyjs/foundation-vitest-config';

export default {
  ...defaultConfig,
  test: {
    ...defaultConfig.test,
    execArgv: ['--expose-gc'],
    projects: defaultConfig.test.projects.map((project) => ({
      ...project,
      test: {
        ...project.test,
        execArgv: ['--expose-gc'],
      },
    })),
  },
};
