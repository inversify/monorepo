import { defaultConfig } from '@inversifyjs/foundation-vitest-config';

export default {
  ...defaultConfig,
  test: {
    ...defaultConfig.test,
    poolOptions: {
      forks: {
        execArgv: ['--expose-gc'],
      },
    },
  },
};
