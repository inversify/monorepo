import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import {
  buildArrayMetadataWithElement,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { commandHandlerMetadataReflectKey } from '../../reflectMetadata/data/commandHandlerMetadataReflectKey.js';
import { type CommandHandlerMetadata } from '../models/CommandHandlerMetadata.js';
import { type CommandHandlerOptions } from '../models/CommandHandlerOptions.js';
import { type TransportDeclaration } from '../models/TransportDeclaration.js';
import { CommandHandler } from './CommandHandler.js';

describe(CommandHandler, () => {
  describe('having command handler options', () => {
    let optionsFixture: CommandHandlerOptions;
    let targetFixture: NewableFunction;

    beforeAll(() => {
      const transportFixture: TransportDeclaration = {
        identifier: Symbol('sync-transport'),
      };

      optionsFixture = {
        command: class ReserveStock {},
        transports: [transportFixture],
      };
      targetFixture = class ReserveStockHandler {};
    });

    describe('when called', () => {
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest
          .mocked(buildArrayMetadataWithElement)
          .mockReturnValueOnce(callbackFixture);

        CommandHandler(optionsFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildArrayMetadataWithElement()', () => {
        const expectedMetadata: CommandHandlerMetadata = {
          command: optionsFixture.command,
          serviceIdentifier: undefined,
          target: targetFixture,
          transports: optionsFixture.transports,
        };

        expect(buildArrayMetadataWithElement).toHaveBeenCalledExactlyOnceWith(
          expectedMetadata,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          Reflect,
          commandHandlerMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
        );
      });
    });
  });

  describe('having command handler options with a service identifier', () => {
    let optionsFixture: CommandHandlerOptions;
    let serviceIdentifierFixture: ServiceIdentifier;
    let targetFixture: NewableFunction;

    beforeAll(() => {
      serviceIdentifierFixture = Symbol('reserve-stock-handler');
      targetFixture = class ReserveStockHandler {};
      optionsFixture = {
        command: class ReserveStock {},
        serviceIdentifier: serviceIdentifierFixture,
        transports: [
          {
            identifier: 'sync-transport',
          },
        ],
      };
    });

    describe('when called', () => {
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest
          .mocked(buildArrayMetadataWithElement)
          .mockReturnValueOnce(callbackFixture);

        CommandHandler(optionsFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildArrayMetadataWithElement() with the service identifier', () => {
        const expectedMetadata: CommandHandlerMetadata = {
          command: optionsFixture.command,
          serviceIdentifier: serviceIdentifierFixture,
          target: targetFixture,
          transports: optionsFixture.transports,
        };

        expect(buildArrayMetadataWithElement).toHaveBeenCalledExactlyOnceWith(
          expectedMetadata,
        );
      });
    });
  });
});
