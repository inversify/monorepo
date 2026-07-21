import { beforeAll, describe, expect, it } from 'vitest';

import {
  LazyServiceIdentifier,
  type ServiceIdentifier,
} from '@inversifyjs/common';

import { type MetadataTag } from '../../metadata/models/MetadataTag.js';
import { BuildMultipleBindingServiceNodeOptionsFixtures } from '../fixtures/BuildMultipleBindingServiceNodeOptionsFixtures.js';
import { BuildSingleBindingServiceNodeOptionsFixtures } from '../fixtures/BuildSingleBindingServiceNodeOptionsFixtures.js';
import { type BuildMultipleBindingServiceNodeOptions } from '../models/BuildMultipleBindingServiceNodeOptions.js';
import { type BuildServiceNodeOptions } from '../models/BuildServiceNodeOptions.js';
import { type BuildSingleBindingServiceNodeOptions } from '../models/BuildSingleBindingServiceNodeOptions.js';
import { type GetPlanOptions } from '../models/GetPlanOptions.js';
import { tryBuildGetPlanOptionsFromBuildServiceNodeOptions } from './tryBuildGetPlanOptionsFromBuildServiceNodeOptions.js';

describe(tryBuildGetPlanOptionsFromBuildServiceNodeOptions, () => {
  describe('having BuildServiceNodeOptions with LazyServiceIdentifier', () => {
    let serviceIdentifierFixture: ServiceIdentifier;
    let optionsFixture: BuildServiceNodeOptions;

    beforeAll(() => {
      serviceIdentifierFixture = Symbol();
      optionsFixture = {
        ...BuildSingleBindingServiceNodeOptionsFixtures.any,
        serviceIdentifier: new LazyServiceIdentifier(
          () => serviceIdentifierFixture,
        ) as unknown as ServiceIdentifier,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result =
          tryBuildGetPlanOptionsFromBuildServiceNodeOptions(optionsFixture);
      });

      it('should return GetPlanOptions', () => {
        const expected: GetPlanOptions = {
          isMultiple: false,
          name: optionsFixture.name,
          optional: optionsFixture.optional,
          serviceIdentifier: serviceIdentifierFixture,
          tag: undefined,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having BuildServiceNodeOptions with no tags', () => {
    let optionsFixture: BuildSingleBindingServiceNodeOptions;

    beforeAll(() => {
      optionsFixture = BuildSingleBindingServiceNodeOptionsFixtures.any;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result =
          tryBuildGetPlanOptionsFromBuildServiceNodeOptions(optionsFixture);
      });

      it('should return GetPlanOptions', () => {
        const expected: GetPlanOptions = {
          isMultiple: false,
          name: optionsFixture.name,
          optional: optionsFixture.optional,
          serviceIdentifier: optionsFixture.serviceIdentifier,
          tag: undefined,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having BuildServiceNodeOptions with a single tag', () => {
    let tagKeyFixture: MetadataTag;
    let tagValueFixture: unknown;
    let optionsFixture: BuildSingleBindingServiceNodeOptions;

    beforeAll(() => {
      tagKeyFixture = 'key';
      tagValueFixture = 'value';
      optionsFixture = {
        ...BuildSingleBindingServiceNodeOptionsFixtures.any,
        tags: new Map([[tagKeyFixture, tagValueFixture]]),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result =
          tryBuildGetPlanOptionsFromBuildServiceNodeOptions(optionsFixture);
      });

      it('should return GetPlanOptions', () => {
        const expected: GetPlanOptions = {
          isMultiple: false,
          name: optionsFixture.name,
          optional: optionsFixture.optional,
          serviceIdentifier: optionsFixture.serviceIdentifier,
          tag: {
            key: tagKeyFixture,
            value: tagValueFixture,
          },
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having BuildServiceNodeOptions with multiple tags', () => {
    let optionsFixture: BuildSingleBindingServiceNodeOptions;

    beforeAll(() => {
      optionsFixture = {
        ...BuildSingleBindingServiceNodeOptionsFixtures.any,
        tags: new Map([
          ['key1', 'value1'],
          ['key2', 'value2'],
        ]),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result =
          tryBuildGetPlanOptionsFromBuildServiceNodeOptions(optionsFixture);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having BuildMultipleBindingServiceNodeOptions', () => {
    let optionsFixture: BuildMultipleBindingServiceNodeOptions;

    beforeAll(() => {
      optionsFixture = BuildMultipleBindingServiceNodeOptionsFixtures.any;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result =
          tryBuildGetPlanOptionsFromBuildServiceNodeOptions(optionsFixture);
      });

      it('should return GetPlanOptions', () => {
        const expected: GetPlanOptions = {
          chained: optionsFixture.chained,
          isMultiple: true,
          name: optionsFixture.name,
          optional: optionsFixture.optional,
          serviceIdentifier: optionsFixture.serviceIdentifier,
          tag: undefined,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having BuildSingleBindingServiceNodeOptions', () => {
    let optionsFixture: BuildSingleBindingServiceNodeOptions;

    beforeAll(() => {
      optionsFixture = BuildSingleBindingServiceNodeOptionsFixtures.any;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result =
          tryBuildGetPlanOptionsFromBuildServiceNodeOptions(optionsFixture);
      });

      it('should return GetPlanOptions', () => {
        const expected: GetPlanOptions = {
          isMultiple: false,
          name: optionsFixture.name,
          optional: optionsFixture.optional,
          serviceIdentifier: optionsFixture.serviceIdentifier,
          tag: undefined,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
