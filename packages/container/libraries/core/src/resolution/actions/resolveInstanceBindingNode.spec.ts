import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';

import { InstanceBindingNode } from '../../planning/models/InstanceBindingNode';
import { ResolutionParams } from '../models/ResolutionParams';
import { resolveInstanceBindingNode } from './resolveInstanceBindingNode';

describe(resolveInstanceBindingNode.name, () => {
  let resolveInstanceBindingConstructorParamsMock: jest.Mock<
    (
      params: ResolutionParams,
      node: InstanceBindingNode,
    ) => unknown[] | Promise<unknown[]>
  >;
  let resolveInstanceBindingNodeAsyncFromConstructorParamsMock: jest.Mock<
    (
      constructorValues: Promise<unknown[]>,
      params: ResolutionParams,
      node: InstanceBindingNode,
    ) => Promise<unknown>
  >;
  let resolveInstanceBindingNodeFromConstructorParamsMock: jest.Mock<
    (
      constructorValues: unknown[],
      params: ResolutionParams,
      node: InstanceBindingNode,
    ) => unknown
  >;

  let paramsFixture: ResolutionParams;
  let nodeFixture: InstanceBindingNode;

  beforeAll(() => {
    resolveInstanceBindingConstructorParamsMock = jest.fn();
    resolveInstanceBindingNodeAsyncFromConstructorParamsMock = jest.fn();
    resolveInstanceBindingNodeFromConstructorParamsMock = jest.fn();

    paramsFixture = Symbol() as unknown as ResolutionParams;
    nodeFixture = Symbol() as unknown as InstanceBindingNode;
  });

  describe('when called, and resolveInstanceBindingConstructorParams() returns an array', () => {
    let constructorResolvedValues: unknown[];
    let instanceResolvedValue: unknown;

    let result: unknown;

    beforeAll(() => {
      constructorResolvedValues = [Symbol()];
      instanceResolvedValue = Symbol();

      resolveInstanceBindingConstructorParamsMock.mockReturnValue(
        constructorResolvedValues,
      );

      resolveInstanceBindingNodeFromConstructorParamsMock.mockReturnValueOnce(
        instanceResolvedValue,
      );

      result = resolveInstanceBindingNode(
        resolveInstanceBindingConstructorParamsMock,
        resolveInstanceBindingNodeAsyncFromConstructorParamsMock,
        resolveInstanceBindingNodeFromConstructorParamsMock,
      )(paramsFixture, nodeFixture);
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should call resolveInstanceBindingConstructorParams()', () => {
      expect(resolveInstanceBindingConstructorParamsMock).toHaveBeenCalledTimes(
        1,
      );
      expect(resolveInstanceBindingConstructorParamsMock).toHaveBeenCalledWith(
        paramsFixture,
        nodeFixture,
      );
    });

    it('should call resolveInstanceBindingNodeFromConstructorParams()', () => {
      expect(
        resolveInstanceBindingNodeFromConstructorParamsMock,
      ).toHaveBeenCalledTimes(1);
      expect(
        resolveInstanceBindingNodeFromConstructorParamsMock,
      ).toHaveBeenCalledWith(
        constructorResolvedValues,
        paramsFixture,
        nodeFixture,
      );
    });

    it('should return expected result', () => {
      expect(result).toBe(instanceResolvedValue);
    });
  });

  describe('when called, and resolveInstanceBindingConstructorParams() returns an array promise', () => {
    let constructorResolvedValues: unknown[];
    let instanceResolvedValue: unknown;

    let result: unknown;

    beforeAll(async () => {
      constructorResolvedValues = [Symbol()];
      instanceResolvedValue = Symbol();

      resolveInstanceBindingConstructorParamsMock.mockReturnValue(
        Promise.resolve(constructorResolvedValues),
      );

      resolveInstanceBindingNodeAsyncFromConstructorParamsMock.mockResolvedValueOnce(
        instanceResolvedValue,
      );

      result = await resolveInstanceBindingNode(
        resolveInstanceBindingConstructorParamsMock,
        resolveInstanceBindingNodeAsyncFromConstructorParamsMock,
        resolveInstanceBindingNodeFromConstructorParamsMock,
      )(paramsFixture, nodeFixture);
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should call resolveInstanceBindingConstructorParams()', () => {
      expect(resolveInstanceBindingConstructorParamsMock).toHaveBeenCalledTimes(
        1,
      );
      expect(resolveInstanceBindingConstructorParamsMock).toHaveBeenCalledWith(
        paramsFixture,
        nodeFixture,
      );
    });

    it('should call resolveInstanceBindingNodeAsyncFromConstructorParams()', () => {
      expect(
        resolveInstanceBindingNodeAsyncFromConstructorParamsMock,
      ).toHaveBeenCalledTimes(1);
      expect(
        resolveInstanceBindingNodeAsyncFromConstructorParamsMock,
      ).toHaveBeenCalledWith(
        Promise.resolve(constructorResolvedValues),
        paramsFixture,
        nodeFixture,
      );
    });

    it('should return expected result', () => {
      expect(result).toBe(instanceResolvedValue);
    });
  });
});
