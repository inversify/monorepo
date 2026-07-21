import { beforeAll, describe, expect, it } from 'vitest';

import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';
import { buildZeroResolvedValueArgumentsResolverJit } from './buildZeroResolvedValueArgumentsResolverJit.js';

class TestFixtures {
  public static node(
    factory: () => object,
  ): ResolvedValueBindingNode<ResolvedValueBinding<object>> {
    return {
      binding: {
        factory,
        metadata: {
          arguments: [],
        },
      },
      params: [],
    } as unknown as ResolvedValueBindingNode<ResolvedValueBinding<object>>;
  }

  public static get params(): ResolutionParams {
    return Symbol() as unknown as ResolutionParams;
  }

  public static get resolvedValue(): object {
    return {};
  }
}

describe(buildZeroResolvedValueArgumentsResolverJit, () => {
  describe('when called, and resolveActivations is not provided', () => {
    let expectedResult: object;

    let result: unknown;

    beforeAll(() => {
      expectedResult = TestFixtures.resolvedValue;

      const resolveNode: (params: ResolutionParams) => Resolved<object> =
        buildZeroResolvedValueArgumentsResolverJit(
          TestFixtures.node((): object => expectedResult),
        );

      result = resolveNode(TestFixtures.params);
    });

    it('should return the factory result', () => {
      expect(result).toBe(expectedResult);
    });
  });

  describe('when called, and resolveActivations is provided', () => {
    describe('when called', () => {
      let expectedResult: object;
      let paramsFixture: ResolutionParams;

      let result: unknown;

      beforeAll(() => {
        expectedResult = TestFixtures.resolvedValue;
        paramsFixture = TestFixtures.params;

        const resolveNode: (params: ResolutionParams) => Resolved<object> =
          buildZeroResolvedValueArgumentsResolverJit(
            TestFixtures.node((): object => expectedResult),
            (
              params: ResolutionParams,
              resolvedValue: Resolved<object>,
            ): Resolved<object> =>
              params === paramsFixture ? resolvedValue : {},
          );

        result = resolveNode(paramsFixture);
      });

      it('should return the activated factory result', () => {
        expect(result).toBe(expectedResult);
      });
    });

    describe('when called, and the activation resolver returns a promise', () => {
      let expectedResult: object;

      let result: unknown;

      beforeAll(async () => {
        expectedResult = TestFixtures.resolvedValue;

        const resolveNode: (params: ResolutionParams) => Resolved<object> =
          buildZeroResolvedValueArgumentsResolverJit(
            TestFixtures.node((): object => expectedResult),
            async (
              _params: ResolutionParams,
              resolvedValue: Resolved<object>,
            ): Promise<object> => resolvedValue,
          );

        result = await resolveNode(TestFixtures.params);
      });

      it('should return the activated factory result', () => {
        expect(result).toBe(expectedResult);
      });
    });
  });
});
