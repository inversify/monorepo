import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

import { LazyServiceIdentifier, ServiceIdentifier } from '@inversifyjs/common';

vitest.mock(
  import('./buildClassElementMetadataFromMaybeClassElementMetadata.js'),
  () => ({
    buildClassElementMetadataFromMaybeClassElementMetadata: vitest
      .fn()
      .mockReturnValue(vitest.fn()),
  }),
);

import { ClassElementMetadata } from '../models/ClassElementMetadata';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata';
import { MultiInjectOptions } from '../models/MultiInjectOptions';
import { buildManagedMetadataFromMaybeClassElementMetadata } from './buildManagedMetadataFromMaybeClassElementMetadata';

describe(buildManagedMetadataFromMaybeClassElementMetadata, () => {
  describe('having single injection kind', () => {
    let kindFixture: ClassElementMetadataKind.singleInjection;
    let serviceIdentifierFixture: ServiceIdentifier | LazyServiceIdentifier;

    let buildClassMetadataMock: Mock<
      (metadata: MaybeClassElementMetadata | undefined) => ClassElementMetadata
    >;

    beforeAll(() => {
      kindFixture = ClassElementMetadataKind.singleInjection;
      serviceIdentifierFixture = 'service-id';

      buildClassMetadataMock = vitest.fn();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(buildManagedMetadataFromMaybeClassElementMetadata)
          .mockReturnValueOnce(buildClassMetadataMock);

        result = buildManagedMetadataFromMaybeClassElementMetadata(
          kindFixture,
          serviceIdentifierFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return expected function', () => {
        expect(result).toBe(buildClassMetadataMock);
      });
    });
  });

  describe('having multiple injection kind and options', () => {
    let kindFixture: ClassElementMetadataKind.multipleInjection;
    let serviceIdentifierFixture: ServiceIdentifier | LazyServiceIdentifier;
    let optionsFixture: MultiInjectOptions;

    beforeAll(() => {
      kindFixture = ClassElementMetadataKind.multipleInjection;
      serviceIdentifierFixture = 'service-id';
      optionsFixture = { chained: true };
    });

    describe('when called', () => {
      let buildClassMetadataMock: Mock<
        (
          metadata: MaybeClassElementMetadata | undefined,
        ) => ClassElementMetadata
      >;

      let result: unknown;

      beforeAll(() => {
        buildClassMetadataMock = vitest.fn();

        vitest
          .mocked(buildManagedMetadataFromMaybeClassElementMetadata)
          .mockReturnValueOnce(buildClassMetadataMock);

        result = buildManagedMetadataFromMaybeClassElementMetadata(
          kindFixture,
          serviceIdentifierFixture,
          optionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return expected function', () => {
        expect(result).toBe(buildClassMetadataMock);
      });
    });
  });
});
