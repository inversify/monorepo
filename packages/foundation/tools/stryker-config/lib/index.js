// @ts-check

/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
  checkers: ['typescript'],
  cleanTempDir: 'always',
  concurrency: 1,
  coverageAnalysis: 'perTest',
  disableTypeChecks: 'src/**/*.ts',
  mutate: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/**/*{Fixtures,Mocks}.ts'],
  packageManager: 'pnpm',
  plugins: [
    '@stryker-mutator/typescript-checker',
    '@stryker-mutator/vitest-runner',
  ],
  tempDirName: 'stryker-tmp',
  testRunner: 'vitest',
  tsconfigFile: './tsconfig.json',
  vitest: {
    configFile: './vitest.config.stryker.mjs',
    related: true,
  },
};
