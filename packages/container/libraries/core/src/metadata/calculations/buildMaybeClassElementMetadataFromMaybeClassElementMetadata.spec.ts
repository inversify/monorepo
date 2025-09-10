import { beforeAll, describe, expect, it, Mock, vitest } from 'vitest';

import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata';
import { MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata';
import { UnmanagedClassElementMetadata } from '../models/UnmanagedClassElementMetadata';
import { buildMaybeClassElementMetadataFromMaybeClassElementMetadata } from './buildMaybeClassElementMetadataFromMaybeClassElementMetadata';

describe(buildMaybeClassElementMetadataFromMaybeClassElementMetadata, () => {
  describe('having unmanaged metadata', () => {
    let metadataFixture: UnmanagedClassElementMetadata;
    let updateMetadataMock: Mock<
      (
        metadata:
          | ManagedClassElementMetadata
          | MaybeManagedClassElementMetadata,
      ) => ManagedClassElementMetadata | MaybeManagedClassElementMetadata
    >;

    beforeAll(() => {
      metadataFixture = {
        kind: ClassElementMetadataKind.unmanaged,
      };
      updateMetadataMock = vitest.fn();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          buildMaybeClassElementMetadataFromMaybeClassElementMetadata(
            updateMetadataMock,
          )(metadataFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an InversifyCoreError', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.injectionDecoratorConflict,
          message:
            'Unexpected injection found. Found @unmanaged injection with additional @named, @optional, @tagged or @targetName injections',
        };

        expect(result).toBeInstanceOf(InversifyCoreError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });

  describe('having non unmanaged metadata', () => {
    let metadataFixture: ManagedClassElementMetadata;
    let updateMetadataMock: Mock<
      (
        metadata:
          | ManagedClassElementMetadata
          | MaybeManagedClassElementMetadata,
      ) => ManagedClassElementMetadata | MaybeManagedClassElementMetadata
    >;

    beforeAll(() => {
      metadataFixture = {
        kind: ClassElementMetadataKind.singleInjection,
        name: undefined,
        optional: false,
        tags: new Map([['foo', 'bar']]),
        value: 'service-identifier',
      };
      updateMetadataMock = vitest.fn();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        updateMetadataMock.mockReturnValueOnce(metadataFixture);

        result =
          buildMaybeClassElementMetadataFromMaybeClassElementMetadata(
            updateMetadataMock,
          )(metadataFixture);
      });

      it('should return ManagedClassElementMetadata', () => {
        expect(result).toBe(metadataFixture);
      });
    });
  });
});
