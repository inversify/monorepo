import { beforeAll, describe, expect, it } from 'vitest';

import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { ManagedClassElementMetadataFixtures } from '../fixtures/ManagedClassElementMetadataFixtures';
import { MaybeManagedClassElementMetadataFixtures } from '../fixtures/MaybeManagedClassElementMetadataFixtures';
import { ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata';
import { MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata';
import { assertMetadataFromTypescriptIfManaged } from './assertMetadataFromTypescriptIfManaged';

describe(assertMetadataFromTypescriptIfManaged, () => {
  describe.each<
    [string, MaybeManagedClassElementMetadata | ManagedClassElementMetadata]
  >([
    [
      "ManagedClassElementMetadata which doesn't come from typescript",
      ManagedClassElementMetadataFixtures.withNoIsFromTypescriptParamType,
    ],
  ])(
    'having %s',
    (
      _: string,
      metadataFixture:
        | MaybeManagedClassElementMetadata
        | ManagedClassElementMetadata,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            assertMetadataFromTypescriptIfManaged(metadataFixture);
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should throw an InversifyCoreError', () => {
          const expectedErrorProperties: Partial<InversifyCoreError> = {
            kind: InversifyCoreErrorKind.injectionDecoratorConflict,
            message:
              'Unexpected injection found. Multiple @inject, @multiInject or @unmanaged decorators found',
          };

          expect(result).toBeInstanceOf(InversifyCoreError);
          expect(result).toStrictEqual(
            expect.objectContaining(expectedErrorProperties),
          );
        });
      });
    },
  );

  describe.each<
    [string, MaybeManagedClassElementMetadata | ManagedClassElementMetadata]
  >([
    [
      'ManagedClassElementMetadata which comes from typescript',
      ManagedClassElementMetadataFixtures.withIsFromTypescriptParamTypeTrue,
    ],
    [
      'MaybeManagedClassElementMetadata',
      MaybeManagedClassElementMetadataFixtures.any,
    ],
  ])(
    'having %s',
    (
      _: string,
      metadataFixture:
        | MaybeManagedClassElementMetadata
        | ManagedClassElementMetadata,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = assertMetadataFromTypescriptIfManaged(metadataFixture);
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    },
  );
});
