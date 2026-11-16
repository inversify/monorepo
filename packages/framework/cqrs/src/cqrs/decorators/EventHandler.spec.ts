import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import {
  buildArrayMetadataWithElement,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { eventHandlerMetadataReflectKey } from '../../reflectMetadata/data/eventHandlerMetadataReflectKey.js';
import { type EventHandlerMetadata } from '../models/EventHandlerMetadata.js';
import { type EventHandlerOptions } from '../models/EventHandlerOptions.js';
import { EventHandler } from './EventHandler.js';

describe(EventHandler, () => {
  describe('having event handler options', () => {
    let optionsFixture: EventHandlerOptions;
    let targetFixture: NewableFunction;

    beforeAll(() => {
      optionsFixture = {
        event: class StockReserved {},
      };
      targetFixture = class StockReservedHandler {};
    });

    describe('when called', () => {
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest
          .mocked(buildArrayMetadataWithElement)
          .mockReturnValueOnce(callbackFixture);

        EventHandler(optionsFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildArrayMetadataWithElement()', () => {
        const expectedMetadata: EventHandlerMetadata = {
          event: optionsFixture.event,
          serviceIdentifier: undefined,
          target: targetFixture,
        };

        expect(buildArrayMetadataWithElement).toHaveBeenCalledExactlyOnceWith(
          expectedMetadata,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          Reflect,
          eventHandlerMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
        );
      });
    });
  });

  describe('having event handler options with a service identifier', () => {
    let optionsFixture: EventHandlerOptions;
    let serviceIdentifierFixture: ServiceIdentifier;
    let targetFixture: NewableFunction;

    beforeAll(() => {
      serviceIdentifierFixture = Symbol('stock-reserved-handler');
      targetFixture = class StockReservedHandler {};
      optionsFixture = {
        event: class StockReserved {},
        serviceIdentifier: serviceIdentifierFixture,
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

        EventHandler(optionsFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildArrayMetadataWithElement() with the service identifier', () => {
        const expectedMetadata: EventHandlerMetadata = {
          event: optionsFixture.event,
          serviceIdentifier: serviceIdentifierFixture,
          target: targetFixture,
        };

        expect(buildArrayMetadataWithElement).toHaveBeenCalledExactlyOnceWith(
          expectedMetadata,
        );
      });
    });
  });
});
