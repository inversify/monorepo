import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import {
  getOwnReflectMetadata,
  setReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { eventMetadataReflectKey } from '../../reflectMetadata/data/eventMetadataReflectKey.js';
import { type EventMetadata } from '../models/EventMetadata.js';
import { Event, type EventOptions } from './Event.js';

describe(Event, () => {
  describe('having an identifier', () => {
    let optionsFixture: EventOptions;
    let targetFixture: NewableFunction;

    beforeAll(() => {
      optionsFixture = {
        identifier: 'stock.reserved',
      };
      targetFixture = class StockReserved {};
    });

    describe('when called, and the event is not defined', () => {
      beforeAll(() => {
        vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(undefined);

        Event(optionsFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getOwnReflectMetadata()', () => {
        expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          eventMetadataReflectKey,
        );
      });

      it('should call setReflectMetadata()', () => {
        const expectedMetadata: EventMetadata = {
          identifier: optionsFixture.identifier,
        };

        expect(setReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          eventMetadataReflectKey,
          expectedMetadata,
        );
      });
    });

    describe('when called, and the event is already defined', () => {
      let errorFixture: unknown;

      beforeAll(() => {
        vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce({
          identifier: 'stock.existing',
        });

        try {
          Event(optionsFixture)(targetFixture);
        } catch (error: unknown) {
          errorFixture = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getOwnReflectMetadata()', () => {
        expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          eventMetadataReflectKey,
        );
      });

      it('should throw an Error', () => {
        expect(errorFixture).toBeInstanceOf(Error);
        expect((errorFixture as Error).message).toBe(
          `Event already defined on target "${targetFixture.name}".`,
        );
      });

      it('should not call setReflectMetadata()', () => {
        expect(setReflectMetadata).not.toHaveBeenCalled();
      });
    });
  });

  describe('having no identifier', () => {
    describe('when called, and the event is not defined', () => {
      let optionsFixture: EventOptions;
      let targetFixture: NewableFunction;

      beforeAll(() => {
        optionsFixture = {};
        targetFixture = class StockReleased {};

        vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(undefined);

        Event(optionsFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call setReflectMetadata() with an undefined identifier', () => {
        const expectedMetadata: EventMetadata = {
          identifier: undefined,
        };

        expect(setReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          eventMetadataReflectKey,
          expectedMetadata,
        );
      });
    });
  });
});
