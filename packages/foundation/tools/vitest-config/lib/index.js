import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export const defaultConfig = defineConfig({
  test: {
    coverage: {
      all: false,
    },
    passWithNoTests: true,
    projects: [
      {
        plugins: [
          swc.vite({
            tsconfigFile: 'tsconfig.esm.json',
          }),
        ],
        test: {
          exclude: ['src/**/*.int.spec.ts'],
          include: ['src/**/*.spec.ts'],
          name: 'Unit',
        },
      },
      {
        plugins: [
          swc.vite({
            tsconfigFile: 'tsconfig.esm.json',
          }),
        ],
        test: {
          include: ['src/**/*.int.spec.ts'],
          name: 'Integration',
        },
      },
      {
        plugins: [
          swc.vite({
            tsconfigFile: 'tsconfig.esm.json',
          }),
        ],
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
      all: true,
    },
    passWithNoTests: true,
  },
});
