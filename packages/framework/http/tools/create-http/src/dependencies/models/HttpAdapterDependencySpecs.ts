import { HttpAdapter } from '../../models/HttpAdapter.js';

export interface AdapterDependencySpec {
  builtDependencies?: readonly string[];
  dependencies: readonly string[];
  devDependencies?: readonly string[];
}

/**
 * Always-installed runtime dependencies, regardless of adapter.
 */
export const BASE_DEPENDENCY_NAMES: readonly string[] = [
  '@inversifyjs/config',
  '@inversifyjs/config-dotenv',
  '@inversifyjs/http-core',
  '@inversifyjs/http-open-api',
  '@inversifyjs/http-validation',
  '@inversifyjs/logger',
  '@inversifyjs/open-api-validation',
  'ajv',
  'ajv-formats',
  'inversify',
  'winston',
  'zod',
];

/**
 * Always-installed tooling/dev dependencies.
 */
export const BASE_DEV_DEPENDENCY_NAMES: readonly string[] = [
  '@eslint/js',
  '@types/node',
  'eslint',
  'eslint-config-prettier',
  'eslint-plugin-prettier',
  'prettier',
  'typescript',
  'typescript-eslint',
];

/**
 * Per-adapter dependency names. Versions are resolved from the Renovate-tracked
 * dependency catalog (`templates/base/package.json`).
 */
export const HTTP_ADAPTER_DEPENDENCY_SPECS: Record<
  HttpAdapter,
  AdapterDependencySpec
> = {
  [HttpAdapter.express]: {
    dependencies: ['@inversifyjs/http-express', 'express'],
    devDependencies: ['@types/express'],
  },
  [HttpAdapter.fastify]: {
    dependencies: ['@inversifyjs/http-fastify', 'fastify'],
  },
  [HttpAdapter.hono]: {
    dependencies: ['@hono/node-server', '@inversifyjs/http-hono', 'hono'],
  },
  [HttpAdapter.uwebsockets]: {
    builtDependencies: ['uWebSockets.js'],
    dependencies: ['@inversifyjs/http-uwebsockets', 'uWebSockets.js'],
  },
};
