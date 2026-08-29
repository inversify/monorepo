import { defineConfig } from 'vitest/config';

// OXC (Vite 8's TS transformer) does not lower TC39 decorators.
// Use SWC to lower them so tests can run on Node.js.
const TS_RE = /\.[cm]?tsx?$/;
const DECORATOR_RE = /^\s*@\w/m;

let swcCore;
try {
  swcCore = await import('@swc/core');
} catch {
  // @swc/core not available — decorator lowering disabled
}

const swcDecoratorPlugin = swcCore
  ? {
      name: 'swc-decorators',
      enforce: 'pre',
      async transform(code, id) {
        if (!TS_RE.test(id)) return null;
        if (!DECORATOR_RE.test(code)) return null;
        const result = await swcCore.transform(code, {
          filename: id,
          jsc: {
            parser: { syntax: 'typescript', decorators: true },
            target: 'es2022',
            transform: { decoratorVersion: '2022-03' },
          },
          module: { type: 'es6' },
          sourceMaps: true,
        });
        return { code: result.code, map: result.map };
      },
    }
  : null;

export const sharedPlugins = [swcDecoratorPlugin].filter(Boolean);

function buildProjectList(plugins) {
  return [
    {
      plugins,
      test: {
        exclude: ['src/**/*.int.spec.ts'],
        include: ['src/**/*.spec.ts'],
        name: 'Unit',
      },
    },
    {
      plugins,
      test: {
        exclude: ['src/**/*.no-eval.int.spec.ts'],
        include: ['src/**/*.int.spec.ts'],
        name: 'Integration',
      },
    },
    {
      plugins,
      test: {
        execArgv: ['--disallow-code-generation-from-strings'],
        include: ['src/**/*.no-eval.int.spec.ts'],
        name: 'Integration (No Eval)',
      },
    },
    {
      plugins,
      test: {
        include: ['src/**/*.spec-d.ts'],
        name: 'Type',
        typecheck: {
          enabled: true,
          include: ['src/**/*.spec-d.ts'],
          only: true,
        },
      },
    },
  ];
}

export function buildConfig(extraPlugins = []) {
  const plugins = [...sharedPlugins, ...extraPlugins];
  return defineConfig({
    plugins,
    test: {
      coverage: {
        all: false,
        exclude: ['src/**/*Fixtures.ts'],
      },
      passWithNoTests: true,
      projects: buildProjectList(plugins),
      sequence: {
        hooks: 'parallel',
      },
    },
  });
}

export const defaultConfig = buildConfig();

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
