import { beforeAll, describe, expect, it } from 'vitest';

import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata';
import { MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata';
import { updateMetadataOptional } from './updateMetadataOptional';

describe(updateMetadataOptional.name, () => {
  describe('having metadata with no optional', () => {
    let metadataFixture:
      | ManagedClassElementMetadata
      | MaybeManagedClassElementMetadata;

    beforeAll(() => {
      metadataFixture = {
        kind: ClassElementMetadataKind.singleInjection,
        name: undefined,
        optional: false,
        tags: new Map(),
        value: 'service-id',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = updateMetadataOptional(metadataFixture);
      });

      it('should return metadata', () => {
        const expected:
          | ManagedClassElementMetadata
          | MaybeManagedClassElementMetadata = {
          ...metadataFixture,
          optional: true,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having metadata with optional', () => {
    let metadataFixture:
      | ManagedClassElementMetadata
      | MaybeManagedClassElementMetadata;

    beforeAll(() => {
      metadataFixture = {
        kind: ClassElementMetadataKind.singleInjection,
        name: undefined,
        optional: true,
        tags: new Map(),
        value: 'service-id',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          updateMetadataOptional(metadataFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw InversifyCoreError', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.injectionDecoratorConflict,
          message: 'Unexpected duplicated optional decorator',
        };

        expect(result).toBeInstanceOf(InversifyCoreError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });
});
