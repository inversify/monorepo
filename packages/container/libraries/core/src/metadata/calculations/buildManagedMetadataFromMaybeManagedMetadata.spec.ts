import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { LazyServiceIdentifier, ServiceIdentifier } from '@inversifyjs/common';

vitest.mock('./assertMetadataFromTypescriptIfManaged');

import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata';
import { MaybeClassElementMetadataKind } from '../models/MaybeClassElementMetadataKind';
import { MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata';
import { MultiInjectOptions } from '../models/MultiInjectOptions';
import { assertMetadataFromTypescriptIfManaged } from './assertMetadataFromTypescriptIfManaged';
import { buildManagedMetadataFromMaybeManagedMetadata } from './buildManagedMetadataFromMaybeManagedMetadata';

describe(buildManagedMetadataFromMaybeManagedMetadata, () => {
  describe('having single injection kind', () => {
    let metadataFixture: MaybeManagedClassElementMetadata;
    let kindFixture: ClassElementMetadataKind.singleInjection;
    let serviceIdentifierFixture: ServiceIdentifier | LazyServiceIdentifier;

    beforeAll(() => {
      metadataFixture = {
        kind: MaybeClassElementMetadataKind.unknown,
        name: 'name-fixture',
        optional: true,
        tags: new Map(),
      };

      kindFixture = ClassElementMetadataKind.singleInjection;
      serviceIdentifierFixture = Symbol();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildManagedMetadataFromMaybeManagedMetadata(
          metadataFixture,
          kindFixture,
          serviceIdentifierFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call assertMetadataFromTypescriptIfManaged()', () => {
        expect(
          assertMetadataFromTypescriptIfManaged,
        ).toHaveBeenCalledExactlyOnceWith(metadataFixture);
      });

      it('should return ManagedClassElementMetadata', () => {
        const expected: ManagedClassElementMetadata = {
          kind: kindFixture,
          name: metadataFixture.name,
          optional: metadataFixture.optional,
          tags: metadataFixture.tags,
          value: serviceIdentifierFixture,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having multiple injection kind and multi inject options', () => {
    let metadataFixture: MaybeManagedClassElementMetadata;
    let kindFixture: ClassElementMetadataKind.multipleInjection;
    let serviceIdentifierFixture: ServiceIdentifier | LazyServiceIdentifier;
    let optionsFixture: MultiInjectOptions;

    beforeAll(() => {
      metadataFixture = {
        kind: MaybeClassElementMetadataKind.unknown,
        name: 'name-fixture',
        optional: true,
        tags: new Map(),
      };

      kindFixture = ClassElementMetadataKind.multipleInjection;
      serviceIdentifierFixture = Symbol();
      optionsFixture = { chained: true };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildManagedMetadataFromMaybeManagedMetadata(
          metadataFixture,
          kindFixture,
          serviceIdentifierFixture,
          optionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call assertMetadataFromTypescriptIfManaged()', () => {
        expect(
          assertMetadataFromTypescriptIfManaged,
        ).toHaveBeenCalledExactlyOnceWith(metadataFixture);
      });

      it('should return ManagedClassElementMetadata with chained property', () => {
        const expected: ManagedClassElementMetadata = {
          chained: true,
          kind: kindFixture,
          name: metadataFixture.name,
          optional: metadataFixture.optional,
          tags: metadataFixture.tags,
          value: serviceIdentifierFixture,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
