import { defineConfig } from 'vitest/config';

export const defaultConfig = defineConfig({
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
          include: ['src/**/*.int.spec.ts'],
          name: 'Integration',
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

export const strykerConfig = defineConfig({
  test: {
    exclude: ['src/**/*.int.spec.ts'],
    include: ['src/**/*.spec.ts'],
    coverage: {
      all: false,
    },
    passWithNoTests: true,
    sequence: {
      hooks: 'parallel',
    },
  },
});
