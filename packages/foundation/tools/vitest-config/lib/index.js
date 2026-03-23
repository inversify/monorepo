import { defineConfig } from 'vitest/config';

export const defaultConfig = defineConfig({
  test: {
    coverage: {
      all: false,
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
          include: ['src/**/*.int.spec.ts'],
          name: 'Integration',
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
