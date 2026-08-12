import { defineConfig } from 'vitest/config';

/**
 * Mirrors `@inversifyjs/foundation-vitest-config` projects, with Integration
 * tuned for the full CLI pipeline (install + build): long timeouts and
 * sequential hooks so package-manager installs do not contend.
 */
export default defineConfig({
  test: {
    coverage: {
      all: false,
      exclude: ['src/**/*Fixtures.ts'],
    },
    passWithNoTests: true,
    projects: [
      {
        test: {
          exclude: ['src/**/*.int.spec.ts'],
          include: ['src/**/*.spec.ts'],
          name: 'Unit',
        },
      },
      {
        test: {
          exclude: ['src/**/*.no-eval.int.spec.ts'],
          hookTimeout: 5 * 60 * 1000,
          include: ['src/**/*.int.spec.ts'],
          name: 'Integration',
          sequence: {
            hooks: 'list',
          },
          testTimeout: 10 * 60 * 1000,
        },
      },
      {
        test: {
          execArgv: ['--disallow-code-generation-from-strings'],
          include: ['src/**/*.no-eval.int.spec.ts'],
          name: 'Integration (No Eval)',
        },
      },
      {
        test: {
          include: ['src/**/*.spec-d.ts'],
          name: 'Type',
        },
      },
    ],
    sequence: {
      hooks: 'parallel',
    },
  },
});
