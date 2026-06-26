import { beforeAll, describe, expect, it } from 'vitest';

import {
  LazyServiceIdentifier,
  type ServiceIdentifier,
} from '@inversifyjs/common';

import { MultipleInjectionManagedClassElementMetadataFixtures } from '../../metadata/fixtures/MultipleInjectionManagedClassElementMetadataFixtures.js';
import { SingleInjectionManagedClassElementMetadataFixtures } from '../../metadata/fixtures/SingleInjectionManagedClassElementMetadataFixtures.js';
import { type MultipleInjectionManagedClassElementMetadata } from '../../metadata/models/MultipleInjectionManagedClassElementMetadata.js';
import { type SingleInjectionManagedClassElementMetadata } from '../../metadata/models/SingleInjectionManagedClassElementMetadata.js';
import { type BuildServiceNodeOptions } from '../../planning/models/BuildServiceNodeOptions.js';
import { buildBuildServiceNodeOptionsFromClassElementMetadata } from './buildBuildServiceNodeOptionsFromClassElementMetadata.js';

describe(buildBuildServiceNodeOptionsFromClassElementMetadata, () => {
  describe('having SingleInjectionManagedClassElementMetadata with LazyServiceIdentifier', () => {
    let serviceIdentifierFixture: ServiceIdentifier;
    let managedClassElementMetadataFixture: SingleInjectionManagedClassElementMetadata;

    beforeAll(() => {
      serviceIdentifierFixture = Symbol();
      managedClassElementMetadataFixture = {
        ...SingleInjectionManagedClassElementMetadataFixtures.any,
        value: new LazyServiceIdentifier(() => serviceIdentifierFixture),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildBuildServiceNodeOptionsFromClassElementMetadata(
          managedClassElementMetadataFixture,
        );
      });

      it('should return BuildServiceNodeOptions with unwrapped service identifier', () => {
        const expected: BuildServiceNodeOptions = {
          isMultiple: false,
          name: managedClassElementMetadataFixture.name,
          optional: managedClassElementMetadataFixture.optional,
          serviceIdentifier: serviceIdentifierFixture,
          tags: managedClassElementMetadataFixture.tags,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having SingleInjectionManagedClassElementMetadata', () => {
    let managedClassElementMetadataFixture: SingleInjectionManagedClassElementMetadata;

    beforeAll(() => {
      managedClassElementMetadataFixture =
        SingleInjectionManagedClassElementMetadataFixtures.any;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildBuildServiceNodeOptionsFromClassElementMetadata(
          managedClassElementMetadataFixture,
        );
      });

      it('should return BuildServiceNodeOptions', () => {
        const expected: BuildServiceNodeOptions = {
          isMultiple: false,
          name: managedClassElementMetadataFixture.name,
          optional: managedClassElementMetadataFixture.optional,
          serviceIdentifier:
            managedClassElementMetadataFixture.value as ServiceIdentifier,
          tags: managedClassElementMetadataFixture.tags,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having MultipleInjectionManagedClassElementMetadata', () => {
    let managedClassElementMetadataFixture: MultipleInjectionManagedClassElementMetadata;

    beforeAll(() => {
      managedClassElementMetadataFixture =
        MultipleInjectionManagedClassElementMetadataFixtures.any;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildBuildServiceNodeOptionsFromClassElementMetadata(
          managedClassElementMetadataFixture,
        );
      });

      it('should return BuildServiceNodeOptions', () => {
        const expected: BuildServiceNodeOptions = {
          chained: managedClassElementMetadataFixture.chained,
          isMultiple: true,
          name: managedClassElementMetadataFixture.name,
          optional: managedClassElementMetadataFixture.optional,
          serviceIdentifier:
            managedClassElementMetadataFixture.value as ServiceIdentifier,
          tags: managedClassElementMetadataFixture.tags,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
