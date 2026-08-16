import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';
import { z } from 'zod';

import { type ConfigService } from '../models/ConfigService.js';
import { configServiceIdentifier } from '../models/configServiceIdentifier.js';
import { InversifyConfigError } from '../models/InversifyConfigError.js';
import { object } from '../sources/object.js';
import { ConfigContainerModule } from './ConfigContainerModule.js';

describe(ConfigContainerModule, () => {
  describe('.fromOptions', () => {
    describe('having a source without validation', () => {
      describe('when called', () => {
        let container: Container;
        let result: unknown;

        beforeAll(async () => {
          container = new Container();

          await container.loadAsync(
            ConfigContainerModule.fromOptions({
              source: object({ PORT: '3000' }),
            }),
          );

          result = container
            .get<ConfigService<{ PORT: string }>>(configServiceIdentifier)
            .get();
        });

        afterAll(() => {
          container.unbindAll();
        });

        it('should bind ConfigService with the loaded config', () => {
          expect(result).toStrictEqual({ PORT: '3000' });
        });
      });
    });

    describe('having a Standard Schema validator', () => {
      describe('when called, and validation succeeds', () => {
        let container: Container;
        let result: unknown;

        beforeAll(async () => {
          container = new Container();

          await container.loadAsync(
            ConfigContainerModule.fromOptions({
              source: object({ PORT: '3000' }),
              validate: z.object({
                PORT: z.coerce.number(),
              }),
            }),
          );

          result = container
            .get<ConfigService<{ PORT: number }>>(configServiceIdentifier)
            .get();
        });

        afterAll(() => {
          container.unbindAll();
        });

        it('should bind ConfigService with the validated config', () => {
          expect(result).toStrictEqual({ PORT: 3000 });
        });
      });

      describe('when called, and validation fails', () => {
        let result: unknown;

        beforeAll(async () => {
          const container: Container = new Container();

          try {
            await container.loadAsync(
              ConfigContainerModule.fromOptions({
                source: object({}),
                validate: z.object({
                  PORT: z.coerce.number(),
                }),
              }),
            );
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should throw an InversifyConfigError', () => {
          expect(result).toBeInstanceOf(InversifyConfigError);
        });
      });
    });

    describe('having a custom serviceIdentifier', () => {
      describe('when called', () => {
        const customServiceIdentifier: unique symbol = Symbol.for(
          '@inversifyjs/config/test/customConfigService',
        );

        let container: Container;
        let result: unknown;

        beforeAll(async () => {
          container = new Container();

          await container.loadAsync(
            ConfigContainerModule.fromOptions({
              serviceIdentifier: customServiceIdentifier,
              source: object({ HOST: 'localhost' }),
            }),
          );

          result = container
            .get<ConfigService<{ HOST: string }>>(customServiceIdentifier)
            .get();
        });

        afterAll(() => {
          container.unbindAll();
        });

        it('should bind ConfigService under the custom service identifier', () => {
          expect(result).toStrictEqual({ HOST: 'localhost' });
        });
      });
    });

    describe('having a ConfigValidator', () => {
      describe('when called', () => {
        let container: Container;
        let result: unknown;

        beforeAll(async () => {
          container = new Container();

          await container.loadAsync(
            ConfigContainerModule.fromOptions({
              source: object({ port: '3000' }),
              validate: {
                validate(input: Record<string, unknown>): { port: number } {
                  return {
                    port: Number(input['port']),
                  };
                },
              },
            }),
          );

          result = container
            .get<ConfigService<{ port: number }>>(configServiceIdentifier)
            .get();
        });

        afterAll(() => {
          container.unbindAll();
        });

        it('should bind ConfigService with the validated config', () => {
          expect(result).toStrictEqual({ port: 3000 });
        });
      });
    });
  });
});
