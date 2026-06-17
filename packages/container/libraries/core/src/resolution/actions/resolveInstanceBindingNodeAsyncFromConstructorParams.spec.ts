import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./resolveInstanceBindingNodeFromConstructorParams.js'));

import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type InstanceBindingNode } from '../../planning/models/InstanceBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveInstanceBindingNodeAsyncFromConstructorParams } from './resolveInstanceBindingNodeAsyncFromConstructorParams.js';
import { resolveInstanceBindingNodeFromConstructorParams } from './resolveInstanceBindingNodeFromConstructorParams.js';

describe(resolveInstanceBindingNodeAsyncFromConstructorParams, () => {
  let constructorValuesFixture: Promise<unknown[]>;
  let constructorResolvedValuesFixture: unknown[];
  let paramsFixture: ResolutionParams;
  let nodeFixture: InstanceBindingNode<unknown, InstanceBinding<unknown>>;

  beforeAll(() => {
    constructorResolvedValuesFixture = [Symbol()];
    constructorValuesFixture = Promise.resolve(
      constructorResolvedValuesFixture,
    );
    paramsFixture = Symbol() as unknown as ResolutionParams;
    nodeFixture = Symbol() as unknown as InstanceBindingNode<
      unknown,
      InstanceBinding<unknown>
    >;
  });

  describe('when called', () => {
    let resolvedValue: unknown;

    let result: unknown;

    beforeAll(async () => {
      resolvedValue = Symbol();

      vitest
        .mocked(resolveInstanceBindingNodeFromConstructorParams)
        .mockReturnValueOnce(resolvedValue);

      result = await resolveInstanceBindingNodeAsyncFromConstructorParams(
        constructorValuesFixture,
        paramsFixture,
        nodeFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call resolveInstanceBindingNodeFromConstructorParams()', () => {
      expect(
        resolveInstanceBindingNodeFromConstructorParams,
      ).toHaveBeenCalledExactlyOnceWith(
        constructorResolvedValuesFixture,
        paramsFixture,
        nodeFixture,
      );
    });

    it('should return expected value', () => {
      expect(result).toBe(resolvedValue);
    });
  });
});
