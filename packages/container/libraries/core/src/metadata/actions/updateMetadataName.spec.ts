import { beforeAll, describe, expect, it } from 'vitest';

import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata';
import { MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata';
import { MetadataName } from '../models/MetadataName';
import { updateMetadataName } from './updateMetadataName';

describe(updateMetadataName.name, () => {
  describe('having metadata with no name', () => {
    let metadataFixture:
      | ManagedClassElementMetadata
      | MaybeManagedClassElementMetadata;
    let nameFixture: MetadataName;

    beforeAll(() => {
      metadataFixture = {
        kind: ClassElementMetadataKind.singleInjection,
        name: undefined,
        optional: false,
        tags: new Map(),
        value: 'service-id',
      };
      nameFixture = 'name-fixture';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = updateMetadataName(nameFixture)(metadataFixture);
      });

      it('should return metadata', () => {
        const expected:
          | ManagedClassElementMetadata
          | MaybeManagedClassElementMetadata = {
          ...metadataFixture,
          name: nameFixture,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having metadata with name', () => {
    let metadataFixture:
      | ManagedClassElementMetadata
      | MaybeManagedClassElementMetadata;
    let nameFixture: MetadataName;

    beforeAll(() => {
      metadataFixture = {
        kind: ClassElementMetadataKind.singleInjection,
        name: 'name-fixture',
        optional: false,
        tags: new Map(),
        value: 'service-id',
      };
      nameFixture = 'name-fixture';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          updateMetadataName(nameFixture)(metadataFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw InversifyCoreError', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.injectionDecoratorConflict,
          message: 'Unexpected duplicated named decorator',
        };

        expect(result).toBeInstanceOf(InversifyCoreError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });
});
