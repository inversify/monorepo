import { beforeAll, describe, expect, it } from 'vitest';

import { BootstrapSourceModelFixtures } from '../fixtures/BootstrapSourceModelFixtures.js';
import { type BootstrapSourceModel } from '../models/BootstrapSourceModel.js';
import { createBootstrapSourceModel } from './createBootstrapSourceModel.js';

describe(createBootstrapSourceModel, () => {
  describe.each([
    [
      'express',
      () => BootstrapSourceModelFixtures.withHttpAdapterExpress,
      'InversifyExpressHttpAdapter',
      '@inversifyjs/http-express',
    ],
    [
      'fastify',
      () => BootstrapSourceModelFixtures.withHttpAdapterFastify,
      'InversifyFastifyHttpAdapter',
      '@inversifyjs/http-fastify',
    ],
    [
      'hono',
      () => BootstrapSourceModelFixtures.withHttpAdapterHono,
      'InversifyHonoHttpAdapter',
      '@inversifyjs/http-hono',
    ],
    [
      'uwebsockets',
      () => BootstrapSourceModelFixtures.withHttpAdapterUwebsockets,
      'InversifyUwebSocketsHttpAdapter',
      '@inversifyjs/http-uwebsockets',
    ],
  ] as const)(
    'having httpAdapter %s',
    (
      _httpAdapter: string,
      getBootstrapSourceModelFixture: () => BootstrapSourceModel,
      adapterClassName: string,
      adapterModuleSpecifier: string,
    ) => {
      describe('when called', () => {
        let result: BootstrapSourceModel;

        beforeAll(() => {
          result = getBootstrapSourceModelFixture();
        });

        it('should return a model for the selected adapter', () => {
          expect(result.adapter.className).toBe(adapterClassName);
          expect(result.imports).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                moduleSpecifier: adapterModuleSpecifier,
                namedImports: [{ name: adapterClassName }],
              }),
              expect.objectContaining({
                moduleSpecifier: 'inversify',
                namedImports: [{ name: 'Container' }],
              }),
            ]),
          );
          expect(result.listenStatements.length).toBeGreaterThan(0);
        });
      });
    },
  );
});
