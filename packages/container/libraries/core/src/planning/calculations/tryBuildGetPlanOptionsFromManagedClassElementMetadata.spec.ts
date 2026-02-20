import { beforeAll, describe, expect, it } from 'vitest';

import {
  LazyServiceIdentifier,
  type ServiceIdentifier,
} from '@inversifyjs/common';

import { ClassElementMetadataKind } from '../../metadata/models/ClassElementMetadataKind.js';
import { type MetadataTag } from '../../metadata/models/MetadataTag.js';
import { type MultipleInjectionManagedClassElementMetadata } from '../../metadata/models/MultipleInjectionManagedClassElementMetadata.js';
import { type SingleInjectionManagedClassElementMetadata } from '../../metadata/models/SingleInjectionManagedClassElementMetadata.js';
import { type GetPlanOptions } from '../models/GetPlanOptions.js';
import { tryBuildGetPlanOptionsFromManagedClassElementMetadata } from './tryBuildGetPlanOptionsFromManagedClassElementMetadata.js';

describe(tryBuildGetPlanOptionsFromManagedClassElementMetadata, () => {
  describe('having ManagedClassElementMetadata with LazyServiceIdentifier', () => {
    let serviceIdentifierFixture: ServiceIdentifier;
    let managedClassElementMetadataFixture: SingleInjectionManagedClassElementMetadata;

    beforeAll(() => {
      serviceIdentifierFixture = Symbol();
      managedClassElementMetadataFixture = {
        isFromTypescriptParamType: true,
        kind: ClassElementMetadataKind.singleInjection,
        name: undefined,
        optional: false,
        tags: new Map(),
        value: new LazyServiceIdentifier(() => serviceIdentifierFixture),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = tryBuildGetPlanOptionsFromManagedClassElementMetadata(
          managedClassElementMetadataFixture,
        );
      });

      it('should return GetPlanOptions', () => {
        const expected: GetPlanOptions = {
          isMultiple: false,
          name: managedClassElementMetadataFixture.name,
          optional: managedClassElementMetadataFixture.optional,
          serviceIdentifier: serviceIdentifierFixture,
          tag: undefined,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having ManagedClassElementMetadata with no tags', () => {
    let managedClassElementMetadataFixture: SingleInjectionManagedClassElementMetadata;

    beforeAll(() => {
      managedClassElementMetadataFixture = {
        isFromTypescriptParamType: true,
        kind: ClassElementMetadataKind.singleInjection,
        name: undefined,
        optional: false,
        tags: new Map(),
        value: Symbol(),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = tryBuildGetPlanOptionsFromManagedClassElementMetadata(
          managedClassElementMetadataFixture,
        );
      });

      it('should return GetPlanOptions', () => {
        const expected: GetPlanOptions = {
          isMultiple: false,
          name: managedClassElementMetadataFixture.name,
          optional: managedClassElementMetadataFixture.optional,
          serviceIdentifier:
            managedClassElementMetadataFixture.value as ServiceIdentifier,
          tag: undefined,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having ManagedClassElementMetadata with a single tag', () => {
    let tagKeyFixture: MetadataTag;
    let tagValueFixture: unknown;
    let managedClassElementMetadataFixture: SingleInjectionManagedClassElementMetadata;

    beforeAll(() => {
      tagKeyFixture = 'key';
      tagValueFixture = 'value';
      managedClassElementMetadataFixture = {
        isFromTypescriptParamType: true,
        kind: ClassElementMetadataKind.singleInjection,
        name: undefined,
        optional: false,
        tags: new Map([[tagKeyFixture, tagValueFixture]]),
        value: Symbol(),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = tryBuildGetPlanOptionsFromManagedClassElementMetadata(
          managedClassElementMetadataFixture,
        );
      });

      it('should return GetPlanOptions', () => {
        const expected: GetPlanOptions = {
          isMultiple: false,
          name: managedClassElementMetadataFixture.name,
          optional: managedClassElementMetadataFixture.optional,
          serviceIdentifier:
            managedClassElementMetadataFixture.value as ServiceIdentifier,
          tag: {
            key: tagKeyFixture,
            value: tagValueFixture,
          },
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having ManagedClassElementMetadata with multiple tags', () => {
    let managedClassElementMetadataFixture: SingleInjectionManagedClassElementMetadata;

    beforeAll(() => {
      managedClassElementMetadataFixture = {
        isFromTypescriptParamType: true,
        kind: ClassElementMetadataKind.singleInjection,
        name: undefined,
        optional: false,
        tags: new Map([
          ['key1', 'value1'],
          ['key2', 'value2'],
        ]),
        value: Symbol(),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = tryBuildGetPlanOptionsFromManagedClassElementMetadata(
          managedClassElementMetadataFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having MultipleInjectionManagedClassElementMetadata', () => {
    let managedClassElementMetadataFixture: MultipleInjectionManagedClassElementMetadata;

    beforeAll(() => {
      managedClassElementMetadataFixture = {
        chained: false,
        isFromTypescriptParamType: true,
        kind: ClassElementMetadataKind.multipleInjection,
        name: undefined,
        optional: false,
        tags: new Map(),
        value: Symbol(),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = tryBuildGetPlanOptionsFromManagedClassElementMetadata(
          managedClassElementMetadataFixture,
        );
      });

      it('should return GetPlanOptions', () => {
        const expected: GetPlanOptions = {
          chained: managedClassElementMetadataFixture.chained,
          isMultiple: true,
          name: managedClassElementMetadataFixture.name,
          optional: managedClassElementMetadataFixture.optional,
          serviceIdentifier:
            managedClassElementMetadataFixture.value as ServiceIdentifier,
          tag: undefined,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having SingleInjectionManagedClassElementMetadata', () => {
    let managedClassElementMetadataFixture: SingleInjectionManagedClassElementMetadata;

    beforeAll(() => {
      managedClassElementMetadataFixture = {
        isFromTypescriptParamType: true,
        kind: ClassElementMetadataKind.singleInjection,
        name: undefined,
        optional: false,
        tags: new Map(),
        value: Symbol(),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = tryBuildGetPlanOptionsFromManagedClassElementMetadata(
          managedClassElementMetadataFixture,
        );
      });

      it('should return GetPlanOptions', () => {
        const expected: GetPlanOptions = {
          isMultiple: false,
          name: managedClassElementMetadataFixture.name,
          optional: managedClassElementMetadataFixture.optional,
          serviceIdentifier:
            managedClassElementMetadataFixture.value as ServiceIdentifier,
          tag: undefined,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
