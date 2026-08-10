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
        '@inversifyjs/http-open-api': '5.4.8',
        '@inversifyjs/http-uwebsockets': '5.4.8',
        '@inversifyjs/http-validation': '5.4.8',
        '@inversifyjs/open-api-validation': '3.5.2',
        '@inversifyjs/prisma': '1.0.0',
        '@prisma/adapter-pg': '7.9.1',
        '@prisma/client': '7.9.1',
        ajv: '8.20.0',
        'ajv-formats': '3.0.1',
        express: '5.2.1',
        fastify: '5.11.0',
        hono: '4.12.34',
        inversify: '8.2.3',
        pg: '8.23.0',
        'uWebSockets.js': 'github:uNetworking/uWebSockets.js#v20.69.0',
        zod: '4.4.3',
      },
      devDependencies: {
        '@eslint/js': '10.0.1',
        '@types/express': '5.0.6',
        '@types/node': '24.13.3',
        dotenv: '17.4.2',
        eslint: '10.8.0',
        'eslint-config-prettier': '10.1.8',
        'eslint-plugin-prettier': '5.5.6',
        prettier: '3.9.6',
        prisma: '7.9.1',
        typescript: '6.0.3',
        'typescript-eslint': '8.65.0',
      },
    };
  });

  describe('having the express adapter and prisma+postgresql', () => {
    describe('when called', () => {
      let result: ReturnType<typeof composeScaffoldDependencies>;

      beforeAll(() => {
        result = composeScaffoldDependencies(
          catalogFixture,
          'express',
          'prisma+postgresql',
        );
      });

      it('should include express and prisma postgresql dependencies', () => {
        expect(result.dependencies).toStrictEqual({
          '@inversifyjs/config': '1.0.0',
          '@inversifyjs/config-dotenv': '1.0.0',
          '@inversifyjs/http-core': '5.4.8',
          '@inversifyjs/http-express': '5.4.8',
          '@inversifyjs/http-open-api': '5.4.8',
          '@inversifyjs/http-validation': '5.4.8',
          '@inversifyjs/open-api-validation': '3.5.2',
          '@inversifyjs/prisma': '1.0.0',
          '@prisma/adapter-pg': '7.9.1',
          '@prisma/client': '7.9.1',
          ajv: '8.20.0',
          'ajv-formats': '3.0.1',
          express: '5.2.1',
          inversify: '8.2.3',
          pg: '8.23.0',
          zod: '4.4.3',
        });
        expect(result.devDependencies).toMatchObject({
          '@types/express': '5.0.6',
          dotenv: '17.4.2',
          prisma: '7.9.1',
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

  describe('having the hono adapter and prisma+postgresql', () => {
    describe('when called', () => {
      let result: ReturnType<typeof composeScaffoldDependencies>;

      beforeAll(() => {
        result = composeScaffoldDependencies(
          catalogFixture,
          'hono',
          'prisma+postgresql',
        );
      });

      it('should include hono, node-server, and prisma without express types', () => {
        expect(result.dependencies).toStrictEqual({
          '@hono/node-server': '2.0.12',
          '@inversifyjs/config': '1.0.0',
          '@inversifyjs/config-dotenv': '1.0.0',
          '@inversifyjs/http-core': '5.4.8',
          '@inversifyjs/http-hono': '5.4.8',
          '@inversifyjs/http-open-api': '5.4.8',
          '@inversifyjs/http-validation': '5.4.8',
          '@inversifyjs/open-api-validation': '3.5.2',
          '@inversifyjs/prisma': '1.0.0',
          '@prisma/adapter-pg': '7.9.1',
          '@prisma/client': '7.9.1',
          ajv: '8.20.0',
          'ajv-formats': '3.0.1',
          hono: '4.12.34',
          inversify: '8.2.3',
          pg: '8.23.0',
          zod: '4.4.3',
        });
        expect(result.devDependencies).not.toHaveProperty('@types/express');
        expect(result.devDependencies).toMatchObject({
          dotenv: '17.4.2',
          prisma: '7.9.1',
        });
      });
    });
  });
});
