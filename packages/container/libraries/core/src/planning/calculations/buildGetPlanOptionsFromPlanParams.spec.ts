import { beforeAll, describe, expect, it } from 'vitest';

import { type GetPlanOptions } from '../models/GetPlanOptions.js';
import { type PlanParams } from '../models/PlanParams.js';
import { buildGetPlanOptionsFromPlanParams } from './buildGetPlanOptionsFromPlanParams.js';

describe(buildGetPlanOptionsFromPlanParams, () => {
  describe('having PlanParams with rootConstraints.isMultiple false', () => {
    let planParamsFixture: PlanParams;

    beforeAll(() => {
      planParamsFixture = {
        rootConstraints: {
          isMultiple: false,
          name: 'testName',
          serviceIdentifier: 'testServiceIdentifier',
          tag: { key: 'testKey', value: 'testValue' },
        },
      } as Partial<PlanParams> as PlanParams;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildGetPlanOptionsFromPlanParams(planParamsFixture);
      });

      it('should return expected GetPlanOptions', () => {
        const expected: GetPlanOptions = {
          isMultiple: false,
          name: 'testName',
          optional: false,
          serviceIdentifier: 'testServiceIdentifier',
          tag: { key: 'testKey', value: 'testValue' },
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having PlanParams with rootConstraints.isMultiple false and isOptional true', () => {
    let planParamsFixture: PlanParams;

    beforeAll(() => {
      planParamsFixture = {
        rootConstraints: {
          chained: false,
          isMultiple: true,
          isOptional: true,
          name: 'testName',
          serviceIdentifier: 'testServiceIdentifier',
          tag: { key: 'testKey', value: 'testValue' },
        },
      } as Partial<PlanParams> as PlanParams;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildGetPlanOptionsFromPlanParams(planParamsFixture);
      });

      it('should return expected GetPlanOptions', () => {
        const expected: GetPlanOptions = {
          chained: false,
          isMultiple: true,
          name: 'testName',
          optional: true,
          serviceIdentifier: 'testServiceIdentifier',
          tag: { key: 'testKey', value: 'testValue' },
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having PlanParams with rootConstraints.isMultiple true', () => {
    let planParamsFixture: PlanParams;

    beforeAll(() => {
      planParamsFixture = {
        rootConstraints: {
          chained: false,
          isMultiple: true,
          name: 'testName',
          serviceIdentifier: 'testServiceIdentifier',
          tag: { key: 'testKey', value: 'testValue' },
        },
      } as Partial<PlanParams> as PlanParams;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildGetPlanOptionsFromPlanParams(planParamsFixture);
      });

      it('should return expected GetPlanOptions', () => {
        const expected: GetPlanOptions = {
          chained: false,
          isMultiple: true,
          name: 'testName',
          optional: false,
          serviceIdentifier: 'testServiceIdentifier',
          tag: { key: 'testKey', value: 'testValue' },
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having PlanParams with rootConstraints.isMultiple true and isOptional true', () => {
    let planParamsFixture: PlanParams;

    beforeAll(() => {
      planParamsFixture = {
        rootConstraints: {
          chained: false,
          isMultiple: true,
          isOptional: true,
          name: 'testName',
          serviceIdentifier: 'testServiceIdentifier',
          tag: { key: 'testKey', value: 'testValue' },
        },
      } as Partial<PlanParams> as PlanParams;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildGetPlanOptionsFromPlanParams(planParamsFixture);
      });

      it('should return expected GetPlanOptions', () => {
        const expected: GetPlanOptions = {
          chained: false,
          isMultiple: true,
          name: 'testName',
          optional: true,
          serviceIdentifier: 'testServiceIdentifier',
          tag: { key: 'testKey', value: 'testValue' },
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
