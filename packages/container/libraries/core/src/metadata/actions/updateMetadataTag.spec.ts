import { beforeAll, describe, expect, it } from 'vitest';

import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind.js';
import { type ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata.js';
import { type MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata.js';
import { type MetadataTag } from '../models/MetadataTag.js';
import { updateMetadataTag } from './updateMetadataTag.js';

describe(updateMetadataTag, () => {
  describe('having metadata with missing tag', () => {
    let metadataFixture:
      | ManagedClassElementMetadata
      | MaybeManagedClassElementMetadata;
    let keyFixture: MetadataTag;
    let valueFixture: unknown;

    beforeAll(() => {
      metadataFixture = {
        kind: ClassElementMetadataKind.singleInjection,
        name: undefined,
        optional: false,
        tags: new Map(),
        value: 'service-id',
      };
      keyFixture = 'tag-fixture';
      valueFixture = Symbol();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = updateMetadataTag(keyFixture, valueFixture)(metadataFixture);
      });

      it('should return metadata', () => {
        const expected:
          | ManagedClassElementMetadata
          | MaybeManagedClassElementMetadata = {
          ...metadataFixture,
          tags: new Map([[keyFixture, valueFixture]]),
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having metadata with existing tag', () => {
    let metadataFixture:
      | ManagedClassElementMetadata
      | MaybeManagedClassElementMetadata;
    let keyFixture: MetadataTag;
    let valueFixture: unknown;

    beforeAll(() => {
      metadataFixture = {
        kind: ClassElementMetadataKind.singleInjection,
        name: undefined,
        optional: false,
        tags: new Map([['tag-fixture', Symbol()]]),
        value: 'service-id',
      };
      keyFixture = 'tag-fixture';
      valueFixture = Symbol();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          updateMetadataTag(keyFixture, valueFixture)(metadataFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw InversifyCoreError', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.injectionDecoratorConflict,
          message: 'Unexpected duplicated tag decorator with existing tag',
        };

        expect(result).toBeInstanceOf(InversifyCoreError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });
});
