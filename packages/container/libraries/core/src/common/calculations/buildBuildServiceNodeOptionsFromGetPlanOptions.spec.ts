import { beforeAll, describe, expect, it } from 'vitest';

import { type MetadataTag } from '../../metadata/models/MetadataTag.js';
import { type BuildServiceNodeOptions } from '../../planning/models/BuildServiceNodeOptions.js';
import { type GetMultipleServicePlanOptions } from '../../planning/models/GetMultipleServicePlanOptions.js';
import { type GetSingleServicePlanOptions } from '../../planning/models/GetSingleServicePlanOptions.js';
import { buildBuildServiceNodeOptionsFromGetPlanOptions } from './buildBuildServiceNodeOptionsFromGetPlanOptions.js';

describe(buildBuildServiceNodeOptionsFromGetPlanOptions, () => {
  describe('having GetSingleServicePlanOptions without tag', () => {
    let optionsFixture: GetSingleServicePlanOptions;

    beforeAll(() => {
      optionsFixture = {
        isMultiple: false,
        name: 'testName',
        optional: true,
        serviceIdentifier: Symbol(),
        tag: undefined,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildBuildServiceNodeOptionsFromGetPlanOptions(optionsFixture);
      });

      it('should return BuildSingleBindingServiceNodeOptions', () => {
        const expected: BuildServiceNodeOptions = {
          isMultiple: false,
          name: 'testName',
          optional: true,
          serviceIdentifier: optionsFixture.serviceIdentifier,
          tags: new Map(),
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having GetSingleServicePlanOptions with tag', () => {
    let tagKeyFixture: MetadataTag;
    let tagValueFixture: unknown;
    let optionsFixture: GetSingleServicePlanOptions;

    beforeAll(() => {
      tagKeyFixture = 'testTag';
      tagValueFixture = Symbol();

      optionsFixture = {
        isMultiple: false,
        name: undefined,
        optional: false,
        serviceIdentifier: Symbol(),
        tag: {
          key: tagKeyFixture,
          value: tagValueFixture,
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildBuildServiceNodeOptionsFromGetPlanOptions(optionsFixture);
      });

      it('should return BuildSingleBindingServiceNodeOptions with tag', () => {
        const expected: BuildServiceNodeOptions = {
          isMultiple: false,
          name: undefined,
          optional: false,
          serviceIdentifier: optionsFixture.serviceIdentifier,
          tags: new Map([[tagKeyFixture, tagValueFixture]]),
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having GetMultipleServicePlanOptions without tag', () => {
    let optionsFixture: GetMultipleServicePlanOptions;

    beforeAll(() => {
      optionsFixture = {
        chained: true,
        isMultiple: true,
        name: 'testName',
        optional: false,
        serviceIdentifier: Symbol(),
        tag: undefined,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildBuildServiceNodeOptionsFromGetPlanOptions(optionsFixture);
      });

      it('should return BuildMultipleBindingServiceNodeOptions', () => {
        const expected: BuildServiceNodeOptions = {
          chained: true,
          isMultiple: true,
          name: 'testName',
          optional: false,
          serviceIdentifier: optionsFixture.serviceIdentifier,
          tags: new Map(),
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having GetMultipleServicePlanOptions with tag', () => {
    let tagKeyFixture: MetadataTag;
    let tagValueFixture: unknown;
    let optionsFixture: GetMultipleServicePlanOptions;

    beforeAll(() => {
      tagKeyFixture = 'multiTag';
      tagValueFixture = Symbol();

      optionsFixture = {
        chained: false,
        isMultiple: true,
        name: undefined,
        optional: true,
        serviceIdentifier: Symbol(),
        tag: {
          key: tagKeyFixture,
          value: tagValueFixture,
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildBuildServiceNodeOptionsFromGetPlanOptions(optionsFixture);
      });

      it('should return BuildMultipleBindingServiceNodeOptions with tag', () => {
        const expected: BuildServiceNodeOptions = {
          chained: false,
          isMultiple: true,
          name: undefined,
          optional: true,
          serviceIdentifier: optionsFixture.serviceIdentifier,
          tags: new Map([[tagKeyFixture, tagValueFixture]]),
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
