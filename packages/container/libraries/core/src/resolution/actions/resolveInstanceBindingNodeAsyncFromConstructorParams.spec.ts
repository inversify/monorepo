import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

import { InstanceBinding } from '../../binding/models/InstanceBinding';
import { InstanceBindingNode } from '../../planning/models/InstanceBindingNode';
import { ResolutionParams } from '../models/ResolutionParams';
import { resolveInstanceBindingNodeAsyncFromConstructorParams } from './resolveInstanceBindingNodeAsyncFromConstructorParams';

describe(resolveInstanceBindingNodeAsyncFromConstructorParams, () => {
  let resolveInstanceBindingNodeFromConstructorParamsMock: Mock<
    (
      constructorValues: unknown[],
      params: ResolutionParams,
      node: InstanceBindingNode<InstanceBinding<unknown>>,
    ) => unknown
  >;

  let constructorValuesFixture: Promise<unknown[]>;
  let constructorResolvedValuesFixture: unknown[];
  let paramsFixture: ResolutionParams;
  let nodeFixture: InstanceBindingNode<InstanceBinding<unknown>>;

  beforeAll(() => {
    constructorResolvedValuesFixture = [Symbol()];
    constructorValuesFixture = Promise.resolve(
      constructorResolvedValuesFixture,
    );
    paramsFixture = Symbol() as unknown as ResolutionParams;
    nodeFixture = Symbol() as unknown as InstanceBindingNode<
      InstanceBinding<unknown>
    >;

    resolveInstanceBindingNodeFromConstructorParamsMock = vitest.fn();
  });

  describe('when called', () => {
    let resolvedValue: unknown;

    let result: unknown;

    beforeAll(async () => {
      resolvedValue = Symbol();

      resolveInstanceBindingNodeFromConstructorParamsMock.mockReturnValueOnce(
        resolvedValue,
      );

      result = await resolveInstanceBindingNodeAsyncFromConstructorParams(
        resolveInstanceBindingNodeFromConstructorParamsMock,
      )(constructorValuesFixture, paramsFixture, nodeFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call resolveInstanceBindingNodeFromConstructorParams()', () => {
      expect(
        resolveInstanceBindingNodeFromConstructorParamsMock,
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
