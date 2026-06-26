import { beforeAll, describe, expect, it } from 'vitest';

import {
  LazyServiceIdentifier,
  type ServiceIdentifier,
} from '@inversifyjs/common';

import { MultipleInjectionResolvedValueElementMetadataFixtures } from '../../metadata/fixtures/MultipleInjectionResolvedValueElementMetadataFixtures.js';
import { SingleInjectionResolvedValueElementMetadataFixtures } from '../../metadata/fixtures/SingleInjectionResolvedValueElementMetadataFixtures.js';
import { type MultipleInjectionResolvedValueElementMetadata } from '../../metadata/models/MultipleInjectionResolvedValueElementMetadata.js';
import { type SingleInjectionResolvedValueElementMetadata } from '../../metadata/models/SingleInjectionResolvedValueElementMetadata.js';
import { type BuildServiceNodeOptions } from '../../planning/models/BuildServiceNodeOptions.js';
import { buildBuildServiceNodeOptionsFromResolvedValueElementMetadata } from './buildBuildServiceNodeOptionsFromResolvedValueElementMetadata.js';

describe(buildBuildServiceNodeOptionsFromResolvedValueElementMetadata, () => {
  describe('having SingleInjectionResolvedValueElementMetadata with LazyServiceIdentifier', () => {
    let serviceIdentifierFixture: ServiceIdentifier;
    let resolvedValueElementMetadataFixture: SingleInjectionResolvedValueElementMetadata;

    beforeAll(() => {
      serviceIdentifierFixture = Symbol();
      resolvedValueElementMetadataFixture = {
        ...SingleInjectionResolvedValueElementMetadataFixtures.any,
        value: new LazyServiceIdentifier(() => serviceIdentifierFixture),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildBuildServiceNodeOptionsFromResolvedValueElementMetadata(
          resolvedValueElementMetadataFixture,
        );
      });

      it('should return BuildServiceNodeOptions with unwrapped service identifier', () => {
        const expected: BuildServiceNodeOptions = {
          isMultiple: false,
          name: resolvedValueElementMetadataFixture.name,
          optional: resolvedValueElementMetadataFixture.optional,
          serviceIdentifier: serviceIdentifierFixture,
          tags: resolvedValueElementMetadataFixture.tags,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having SingleInjectionResolvedValueElementMetadata', () => {
    let resolvedValueElementMetadataFixture: SingleInjectionResolvedValueElementMetadata;

    beforeAll(() => {
      resolvedValueElementMetadataFixture =
        SingleInjectionResolvedValueElementMetadataFixtures.any;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildBuildServiceNodeOptionsFromResolvedValueElementMetadata(
          resolvedValueElementMetadataFixture,
        );
      });

      it('should return BuildServiceNodeOptions', () => {
        const expected: BuildServiceNodeOptions = {
          isMultiple: false,
          name: resolvedValueElementMetadataFixture.name,
          optional: resolvedValueElementMetadataFixture.optional,
          serviceIdentifier:
            resolvedValueElementMetadataFixture.value as ServiceIdentifier,
          tags: resolvedValueElementMetadataFixture.tags,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having MultipleInjectionResolvedValueElementMetadata', () => {
    let resolvedValueElementMetadataFixture: MultipleInjectionResolvedValueElementMetadata;

    beforeAll(() => {
      resolvedValueElementMetadataFixture =
        MultipleInjectionResolvedValueElementMetadataFixtures.any;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildBuildServiceNodeOptionsFromResolvedValueElementMetadata(
          resolvedValueElementMetadataFixture,
        );
      });

      it('should return BuildServiceNodeOptions', () => {
        const expected: BuildServiceNodeOptions = {
          chained: resolvedValueElementMetadataFixture.chained,
          isMultiple: true,
          name: resolvedValueElementMetadataFixture.name,
          optional: resolvedValueElementMetadataFixture.optional,
          serviceIdentifier:
            resolvedValueElementMetadataFixture.value as ServiceIdentifier,
          tags: resolvedValueElementMetadataFixture.tags,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
