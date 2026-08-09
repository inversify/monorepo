import { beforeAll, describe, expect, it } from 'vitest';

import { type DependencyCatalog } from '../models/DependencyCatalog.js';
import { composeScaffoldDependencies } from './composeScaffoldDependencies.js';

describe(composeScaffoldDependencies, () => {
  let catalogFixture: DependencyCatalog;

  beforeAll(() => {
    catalogFixture = {
      dependencies: {
        '@hono/node-server': '2.0.12',
        '@inversifyjs/config': '1.0.0',
        '@inversifyjs/config-dotenv': '1.0.0',
        '@inversifyjs/http-core': '5.4.8',
        '@inversifyjs/http-express': '5.4.8',
        '@inversifyjs/http-fastify': '5.4.8',
        '@inversifyjs/http-hono': '5.4.8',
        '@inversifyjs/http-uwebsockets': '5.4.8',
        express: '5.2.1',
        fastify: '5.11.0',
        hono: '4.12.34',
        inversify: '8.2.3',
        'uWebSockets.js': 'github:uNetworking/uWebSockets.js#v20.69.0',
        zod: '4.4.3',
      },
      devDependencies: {
        '@eslint/js': '10.0.1',
        '@types/express': '5.0.6',
        '@types/node': '24.13.3',
        eslint: '10.8.0',
        'eslint-config-prettier': '10.1.8',
        'eslint-plugin-prettier': '5.5.6',
        prettier: '3.9.6',
        typescript: '6.0.3',
        'typescript-eslint': '8.65.0',
      },
    };
  });

  describe('having the express adapter', () => {
    describe('when called', () => {
      let result: ReturnType<typeof composeScaffoldDependencies>;

      beforeAll(() => {
        result = composeScaffoldDependencies(catalogFixture, 'express');
      });

      it('should include only express adapter dependencies', () => {
        expect(result.dependencies).toStrictEqual({
          '@inversifyjs/config': '1.0.0',
          '@inversifyjs/config-dotenv': '1.0.0',
          '@inversifyjs/http-core': '5.4.8',
          '@inversifyjs/http-express': '5.4.8',
          express: '5.2.1',
          inversify: '8.2.3',
          zod: '4.4.3',
        });
        expect(result.devDependencies).toMatchObject({
          '@types/express': '5.0.6',
          typescript: '6.0.3',
        });
        expect(result.dependencies).not.toHaveProperty('fastify');
        expect(result.dependencies).not.toHaveProperty('hono');
        expect(result.dependencies).not.toHaveProperty(
          '@inversifyjs/http-fastify',
        );
      });
    });
  });

  describe('having the hono adapter', () => {
    describe('when called', () => {
      let result: ReturnType<typeof composeScaffoldDependencies>;

      beforeAll(() => {
        result = composeScaffoldDependencies(catalogFixture, 'hono');
      });

      it('should include hono and node-server without express types', () => {
        expect(result.dependencies).toStrictEqual({
          '@hono/node-server': '2.0.12',
          '@inversifyjs/config': '1.0.0',
          '@inversifyjs/config-dotenv': '1.0.0',
          '@inversifyjs/http-core': '5.4.8',
          '@inversifyjs/http-hono': '5.4.8',
          hono: '4.12.34',
          inversify: '8.2.3',
          zod: '4.4.3',
        });
        expect(result.devDependencies).not.toHaveProperty('@types/express');
      });
    });
  });
});
