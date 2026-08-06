import { beforeAll, describe, expect, it } from 'vitest';

import { type HttpAdapter } from '../../models/HttpAdapter.js';
import { type BootstrapSourceModel } from '../models/BootstrapSourceModel.js';
import { createBootstrapSourceModel } from './createBootstrapSourceModel.js';

describe(createBootstrapSourceModel, () => {
  describe.each([
    ['express', 'InversifyExpressHttpAdapter', '@inversifyjs/http-express'],
    ['fastify', 'InversifyFastifyHttpAdapter', '@inversifyjs/http-fastify'],
    ['hono', 'InversifyHonoHttpAdapter', '@inversifyjs/http-hono'],
    [
      'uwebsockets',
      'InversifyUwebSocketsHttpAdapter',
      '@inversifyjs/http-uwebsockets',
    ],
  ] as const)(
    'having httpAdapter %s',
    (
      httpAdapter: HttpAdapter,
      adapterClassName: string,
      adapterModuleSpecifier: string,
    ) => {
      describe('when called', () => {
        let result: BootstrapSourceModel;

        beforeAll(() => {
          result = createBootstrapSourceModel(httpAdapter);
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
