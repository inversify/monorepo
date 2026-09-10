import { beforeAll, describe, expect, it } from 'vitest';

import { InitializeContainerSourceModelFixtures } from '../fixtures/InitializeContainerSourceModelFixtures.js';
import { type InitializeContainerSourceModel } from '../models/InitializeContainerSourceModel.js';
import { createInitializeContainerSourceModel } from './createInitializeContainerSourceModel.js';

describe(createInitializeContainerSourceModel, () => {
  describe('having the default prisma+postgresql adapter', () => {
    describe('when called', () => {
      let result: InitializeContainerSourceModel;

      beforeAll(() => {
        result =
          InitializeContainerSourceModelFixtures.withDbAdapterPrismaPostgresql;
      });

      it('should return a model that loads logger, status, and prisma todo modules', () => {
        expect(result.imports).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              moduleSpecifier: 'inversify',
              namedImports: [{ name: 'Container' }],
            }),
            expect.objectContaining({
              moduleSpecifier:
                '../../logger/containerModules/LoggerContainerModule.js',
              namedImports: [{ name: 'LoggerContainerModule' }],
            }),
            expect.objectContaining({
              moduleSpecifier:
                '../../status/adapter/inversify/containerModules/StatusContainerModule.js',
              namedImports: [{ name: 'StatusContainerModule' }],
            }),
            expect.objectContaining({
              moduleSpecifier: '@inversifyjs/prisma',
              namedImports: [{ name: 'PrismaContainerModule' }],
            }),
            expect.objectContaining({
              moduleSpecifier:
                '../../todo/adapter/inversify/containerModules/TodoContainerModule.js',
              namedImports: [{ name: 'TodoContainerModule' }],
            }),
          ]),
        );
        expect(result.initializeContainerBodyStatements).toStrictEqual(
          expect.arrayContaining([
            'const { LOG_LEVELS } = configService.get();',
            'container.load(new LoggerContainerModule({ logTypes: LOG_LEVELS }));',
            'container.load(new StatusContainerModule());',
            'container.load(new TodoContainerModule());',
            'container.load(new TodoPrismaContainerModule());',
          ]),
        );
      });
    });
  });
});
