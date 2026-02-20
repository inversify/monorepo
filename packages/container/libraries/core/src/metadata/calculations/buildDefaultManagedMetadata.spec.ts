import { beforeAll, describe, expect, it } from 'vitest';

import { type ServiceIdentifier } from '@inversifyjs/common';

import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind.js';
import { type ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata.js';
import { type MultiInjectOptions } from '../models/MultiInjectOptions.js';
import { buildDefaultManagedMetadata } from './buildDefaultManagedMetadata.js';

describe(buildDefaultManagedMetadata, () => {
  describe('having a single injection kind', () => {
    let metadataKindFixture: ClassElementMetadataKind.singleInjection;
    let serviceIdentifierFixture: ServiceIdentifier;

    beforeAll(() => {
      metadataKindFixture = ClassElementMetadataKind.singleInjection;
      serviceIdentifierFixture = 'service-id';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildDefaultManagedMetadata(
          metadataKindFixture,
          serviceIdentifierFixture,
        );
      });

      it('should return ManagedClassElementMetadata', () => {
        const expected: ManagedClassElementMetadata = {
          kind: metadataKindFixture,
          name: undefined,
          optional: false,
          tags: new Map(),
          value: serviceIdentifierFixture,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a multiple injection kind and no multiple injection options', () => {
    let metadataKindFixture: ClassElementMetadataKind.multipleInjection;
    let serviceIdentifierFixture: ServiceIdentifier;

    beforeAll(() => {
      metadataKindFixture = ClassElementMetadataKind.multipleInjection;
      serviceIdentifierFixture = 'service-id';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildDefaultManagedMetadata(
          metadataKindFixture,
          serviceIdentifierFixture,
          undefined,
        );
      });

      it('should return ManagedClassElementMetadata', () => {
        const expected: ManagedClassElementMetadata = {
          chained: false,
          kind: metadataKindFixture,
          name: undefined,
          optional: false,
          tags: new Map(),
          value: serviceIdentifierFixture,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a multiple injection kind and multiple injection options', () => {
    let metadataKindFixture: ClassElementMetadataKind.multipleInjection;
    let serviceIdentifierFixture: ServiceIdentifier;
    let optionsFixture: MultiInjectOptions;

    beforeAll(() => {
      metadataKindFixture = ClassElementMetadataKind.multipleInjection;
      serviceIdentifierFixture = 'service-id';
      optionsFixture = { chained: true };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildDefaultManagedMetadata(
          metadataKindFixture,
          serviceIdentifierFixture,
          optionsFixture,
        );
      });

      it('should return ManagedClassElementMetadata', () => {
        const expected: ManagedClassElementMetadata = {
          chained: true,
          kind: metadataKindFixture,
          name: undefined,
          optional: false,
          tags: new Map(),
          value: serviceIdentifierFixture,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
