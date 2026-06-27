import { beforeAll, describe, expect, it } from 'vitest';

import { type ServiceIdentifier } from '@inversifyjs/common';

import { type MetadataTag } from '../../metadata/models/MetadataTag.js';
import { type BuildServiceNodeOptions } from '../../planning/models/BuildServiceNodeOptions.js';
import { type MultipleBindingPlanParamsConstraint } from '../../planning/models/MultipleBindingPlanParamsConstraint.js';
import { type SingleBindingPlanParamsConstraint } from '../../planning/models/SingleBindingPlanParamsConstraint.js';
import { buildBuildServiceNodeOptionsFromPlanParamsConstraints } from './buildBuildServiceNodeOptionsFromPlanParamsConstraints.js';

describe(buildBuildServiceNodeOptionsFromPlanParamsConstraints, () => {
  describe('having SingleBindingPlanParamsConstraint without tag', () => {
    let constraintsFixture: SingleBindingPlanParamsConstraint;

    beforeAll(() => {
      constraintsFixture = {
        isMultiple: false,
        serviceIdentifier: Symbol(),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result =
          buildBuildServiceNodeOptionsFromPlanParamsConstraints(
            constraintsFixture,
          );
      });

      it('should return BuildSingleBindingServiceNodeOptions', () => {
        const expected: BuildServiceNodeOptions = {
          isMultiple: false,
          name: undefined,
          optional: false,
          serviceIdentifier: constraintsFixture.serviceIdentifier,
          tags: new Map(),
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having SingleBindingPlanParamsConstraint with tag', () => {
    let constraintsFixture: SingleBindingPlanParamsConstraint;
    let tagKeyFixture: MetadataTag;
    let tagValueFixture: unknown;

    beforeAll(() => {
      tagKeyFixture = 'testTag';
      tagValueFixture = Symbol();

      constraintsFixture = {
        isMultiple: false,
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
        result =
          buildBuildServiceNodeOptionsFromPlanParamsConstraints(
            constraintsFixture,
          );
      });

      it('should return BuildSingleBindingServiceNodeOptions with tag', () => {
        const expected: BuildServiceNodeOptions = {
          isMultiple: false,
          name: undefined,
          optional: false,
          serviceIdentifier: constraintsFixture.serviceIdentifier,
          tags: new Map([[tagKeyFixture, tagValueFixture]]),
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having SingleBindingPlanParamsConstraint with name and isOptional', () => {
    let constraintsFixture: SingleBindingPlanParamsConstraint;

    beforeAll(() => {
      constraintsFixture = {
        isMultiple: false,
        isOptional: true,
        name: 'testName',
        serviceIdentifier: Symbol(),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result =
          buildBuildServiceNodeOptionsFromPlanParamsConstraints(
            constraintsFixture,
          );
      });

      it('should return BuildSingleBindingServiceNodeOptions with name and optional true', () => {
        const expected: BuildServiceNodeOptions = {
          isMultiple: false,
          name: 'testName',
          optional: true,
          serviceIdentifier: constraintsFixture.serviceIdentifier,
          tags: new Map(),
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having MultipleBindingPlanParamsConstraint without tag', () => {
    let constraintsFixture: MultipleBindingPlanParamsConstraint;

    beforeAll(() => {
      constraintsFixture = {
        chained: true,
        isMultiple: true,
        serviceIdentifier: Symbol(),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result =
          buildBuildServiceNodeOptionsFromPlanParamsConstraints(
            constraintsFixture,
          );
      });

      it('should return BuildMultipleBindingServiceNodeOptions', () => {
        const expected: BuildServiceNodeOptions = {
          chained: true,
          isMultiple: true,
          name: undefined,
          optional: false,
          serviceIdentifier: constraintsFixture.serviceIdentifier,
          tags: new Map(),
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having MultipleBindingPlanParamsConstraint with tag', () => {
    let constraintsFixture: MultipleBindingPlanParamsConstraint;
    let tagKeyFixture: MetadataTag;
    let tagValueFixture: unknown;

    beforeAll(() => {
      tagKeyFixture = 'multiTag';
      tagValueFixture = Symbol();

      constraintsFixture = {
        chained: false,
        isMultiple: true,
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
        result =
          buildBuildServiceNodeOptionsFromPlanParamsConstraints(
            constraintsFixture,
          );
      });

      it('should return BuildMultipleBindingServiceNodeOptions with tag', () => {
        const expected: BuildServiceNodeOptions = {
          chained: false,
          isMultiple: true,
          name: undefined,
          optional: false,
          serviceIdentifier: constraintsFixture.serviceIdentifier,
          tags: new Map([[tagKeyFixture, tagValueFixture]]),
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having MultipleBindingPlanParamsConstraint with name and isOptional', () => {
    let constraintsFixture: MultipleBindingPlanParamsConstraint;
    let serviceIdentifierFixture: ServiceIdentifier;

    beforeAll(() => {
      serviceIdentifierFixture = Symbol();

      constraintsFixture = {
        chained: false,
        isMultiple: true,
        isOptional: true,
        name: 'multiName',
        serviceIdentifier: serviceIdentifierFixture,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result =
          buildBuildServiceNodeOptionsFromPlanParamsConstraints(
            constraintsFixture,
          );
      });

      it('should return BuildMultipleBindingServiceNodeOptions with name and optional true', () => {
        const expected: BuildServiceNodeOptions = {
          chained: false,
          isMultiple: true,
          name: 'multiName',
          optional: true,
          serviceIdentifier: serviceIdentifierFixture,
          tags: new Map(),
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
