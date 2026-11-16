import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import {
  getOwnReflectMetadata,
  setReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { queryMetadataReflectKey } from '../../reflectMetadata/data/queryMetadataReflectKey.js';
import { type QueryMetadata } from '../models/QueryMetadata.js';
import { Query, type QueryOptions } from './Query.js';

describe(Query, () => {
  describe('having an identifier', () => {
    let optionsFixture: QueryOptions;
    let targetFixture: NewableFunction;

    beforeAll(() => {
      optionsFixture = {
        identifier: 'stock.get',
      };
      targetFixture = class GetStock {};
    });

    describe('when called, and the query is not defined', () => {
      beforeAll(() => {
        vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(undefined);

        Query(optionsFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getOwnReflectMetadata()', () => {
        expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          queryMetadataReflectKey,
        );
      });

      it('should call setReflectMetadata()', () => {
        const expectedMetadata: QueryMetadata = {
          identifier: optionsFixture.identifier,
        };

        expect(setReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          queryMetadataReflectKey,
          expectedMetadata,
        );
      });
    });

    describe('when called, and the query is already defined', () => {
      let errorFixture: unknown;

      beforeAll(() => {
        vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce({
          identifier: 'stock.existing',
        });

        try {
          Query(optionsFixture)(targetFixture);
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
          queryMetadataReflectKey,
        );
      });

      it('should throw an Error', () => {
        expect(errorFixture).toBeInstanceOf(Error);
        expect((errorFixture as Error).message).toBe(
          `Query already defined on target "${targetFixture.name}".`,
        );
      });

      it('should not call setReflectMetadata()', () => {
        expect(setReflectMetadata).not.toHaveBeenCalled();
      });
    });
  });

  describe('having no identifier', () => {
    describe('when called, and the query is not defined', () => {
      let optionsFixture: QueryOptions;
      let targetFixture: NewableFunction;

      beforeAll(() => {
        optionsFixture = {};
        targetFixture = class GetRelease {};

        vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(undefined);

        Query(optionsFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call setReflectMetadata() with an undefined identifier', () => {
        const expectedMetadata: QueryMetadata = {
          identifier: undefined,
        };

        expect(setReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          queryMetadataReflectKey,
          expectedMetadata,
        );
      });
    });
  });
});
