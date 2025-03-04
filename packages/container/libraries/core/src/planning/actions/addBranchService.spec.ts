import { beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/common');

import {
  ServiceIdentifier,
  stringifyServiceIdentifier,
} from '@inversifyjs/common';

import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { BasePlanParams } from '../models/BasePlanParams';
import { addBranchService } from './addBranchService';

describe(addBranchService.name, () => {
  describe('having BasePlanParams with empty servicesBranch', () => {
    let basePlanParamsFixture: BasePlanParams;
    let serviceIdentifierFixture: ServiceIdentifier;

    beforeAll(() => {
      basePlanParamsFixture = {
        servicesBranch: new Set(),
      } as Partial<BasePlanParams> as BasePlanParams;
      serviceIdentifierFixture = 'service-id';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = addBranchService(
          basePlanParamsFixture,
          serviceIdentifierFixture,
        );
      });

      it('should add seriveIdentifier to basePlanParams.serviceBranch', () => {
        expect(basePlanParamsFixture.servicesBranch).toContain(
          serviceIdentifierFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having BasePlanParams with servicesBranch with serviceIdentifier', () => {
    let basePlanParamsFixture: BasePlanParams;
    let serviceIdentifierFixture: ServiceIdentifier;

    beforeAll(() => {
      serviceIdentifierFixture = 'service-id';
      basePlanParamsFixture = {
        servicesBranch: new Set([serviceIdentifierFixture]),
      } as Partial<BasePlanParams> as BasePlanParams;
    });

    describe('when called', () => {
      let stringifiedServiceIdentifier: string;

      let result: unknown;

      beforeAll(() => {
        stringifiedServiceIdentifier = 'stringified-service-id';

        vitest
          .mocked(stringifyServiceIdentifier)
          .mockReturnValueOnce(stringifiedServiceIdentifier)
          .mockReturnValueOnce(stringifiedServiceIdentifier);

        try {
          addBranchService(basePlanParamsFixture, serviceIdentifierFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an InversifyCoreError', () => {
        const expected: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.planning,
          message: `Circular dependency found: ${stringifiedServiceIdentifier} -> ${stringifiedServiceIdentifier}`,
        };

        expect(result).toBeInstanceOf(InversifyCoreError);
        expect(result).toStrictEqual(expect.objectContaining(expected));
      });
    });
  });
});
