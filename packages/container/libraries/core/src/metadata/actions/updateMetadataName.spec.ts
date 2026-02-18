import { beforeAll, describe, expect, it } from 'vitest';

import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind.js';
import { type ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata.js';
import { type MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata.js';
import { type MetadataName } from '../models/MetadataName.js';
import { updateMetadataName } from './updateMetadataName.js';

describe(updateMetadataName, () => {
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
