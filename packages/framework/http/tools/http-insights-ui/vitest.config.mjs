import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    clearMocks: false,
    coverage: {
      all: false,
      exclude: ['src/**/*Fixtures.ts'],
    },
    environment: 'jsdom',
    passWithNoTests: true,
    projects: [
      {
        test: {
          environment: 'jsdom',
          exclude: ['src/**/*.int.spec.ts', 'src/**/*.int.spec.tsx'],
          include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
          name: 'Unit',
        },
      },
      {
        test: {
          include: ['src/**/*.int.spec.ts', 'src/**/*.int.spec.tsx'],
          name: 'Integration',
        },
      },
    ],
  },
});
