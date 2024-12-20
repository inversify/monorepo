import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';

jest.mock('./buildDefaultUnmanagedMetadata');

import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { MaybeClassElementMetadataKind } from '../models/MaybeClassElementMetadataKind';
import { MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata';
import { UnmanagedClassElementMetadata } from '../models/UnmanagedClassElementMetadata';
import { buildDefaultUnmanagedMetadata } from './buildDefaultUnmanagedMetadata';
import { buildUnmanagedMetadataFromMaybeManagedMetadata } from './buildUnmanagedMetadataFromMaybeManagedMetadata';

describe(buildUnmanagedMetadataFromMaybeManagedMetadata.name, () => {
  describe.each<[string, MaybeManagedClassElementMetadata]>([
    [
      'with name',
      {
        kind: MaybeClassElementMetadataKind.unknown,
        name: 'name-fixture',
        optional: false,
        tags: new Map(),
        targetName: undefined,
      },
    ],
    [
      'with optional true',
      {
        kind: MaybeClassElementMetadataKind.unknown,
        name: undefined,
        optional: true,
        tags: new Map(),
        targetName: undefined,
      },
    ],
    [
      'with tags',
      {
        kind: MaybeClassElementMetadataKind.unknown,
        name: undefined,
        optional: false,
        tags: new Map([['foo', 'bar']]),
        targetName: undefined,
      },
    ],
    [
      'with targetName',
      {
        kind: MaybeClassElementMetadataKind.unknown,
        name: undefined,
        optional: false,
        tags: new Map(),
        targetName: 'target-name-fixture',
      },
    ],
  ])(
    'having managed metadata %s',
    (
      _: string,
      maybeManagedClassElementMetadata: MaybeManagedClassElementMetadata,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            buildUnmanagedMetadataFromMaybeManagedMetadata(
              maybeManagedClassElementMetadata,
            );
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
    },
  );

  describe('having non managed metadata', () => {
    let maybeManagedClassElementMetadata: MaybeManagedClassElementMetadata;

    beforeAll(() => {
      maybeManagedClassElementMetadata = {
        kind: MaybeClassElementMetadataKind.unknown,
        name: undefined,
        optional: false,
        tags: new Map(),
        targetName: undefined,
      };
    });

    describe('when called', () => {
      let unmanagedClassElementMetadataFixture: UnmanagedClassElementMetadata;

      let result: unknown;

      beforeAll(() => {
        unmanagedClassElementMetadataFixture = {
          kind: ClassElementMetadataKind.unmanaged,
        };

        (
          buildDefaultUnmanagedMetadata as jest.Mock<
            typeof buildDefaultUnmanagedMetadata
          >
        ).mockReturnValueOnce(unmanagedClassElementMetadataFixture);

        result = buildUnmanagedMetadataFromMaybeManagedMetadata(
          maybeManagedClassElementMetadata,
        );
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call buildDefaultUnmanagedMetadata()', () => {
        expect(buildDefaultUnmanagedMetadata).toHaveBeenCalledTimes(1);
        expect(buildDefaultUnmanagedMetadata).toHaveBeenCalledWith();
      });

      it('should return UnmanagedClassElementMetadata', () => {
        expect(result).toBe(unmanagedClassElementMetadataFixture);
      });
    });
  });
});
