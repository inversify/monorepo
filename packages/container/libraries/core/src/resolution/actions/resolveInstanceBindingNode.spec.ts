import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

import { InstanceBindingNode } from '../../planning/models/InstanceBindingNode';
import { ResolutionParams } from '../models/ResolutionParams';
import { resolveInstanceBindingNode } from './resolveInstanceBindingNode';

describe(resolveInstanceBindingNode, () => {
  let resolveInstanceBindingConstructorParamsMock: Mock<
    (
      params: ResolutionParams,
      node: InstanceBindingNode,
    ) => unknown[] | Promise<unknown[]>
  >;
  let resolveInstanceBindingNodeAsyncFromConstructorParamsMock: Mock<
    (
      constructorValues: Promise<unknown[]>,
      params: ResolutionParams,
      node: InstanceBindingNode,
    ) => Promise<unknown>
  >;
  let resolveInstanceBindingNodeFromConstructorParamsMock: Mock<
    (
      constructorValues: unknown[],
      params: ResolutionParams,
      node: InstanceBindingNode,
    ) => unknown
  >;

  let paramsFixture: ResolutionParams;
  let nodeFixture: InstanceBindingNode;

  beforeAll(() => {
    resolveInstanceBindingConstructorParamsMock = vitest.fn();
    resolveInstanceBindingNodeAsyncFromConstructorParamsMock = vitest.fn();
    resolveInstanceBindingNodeFromConstructorParamsMock = vitest.fn();

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
      vitest.clearAllMocks();
    });

    it('should call resolveInstanceBindingConstructorParams()', () => {
      expect(
        resolveInstanceBindingConstructorParamsMock,
      ).toHaveBeenCalledExactlyOnceWith(paramsFixture, nodeFixture);
    });

    it('should call resolveInstanceBindingNodeFromConstructorParams()', () => {
      expect(
        resolveInstanceBindingNodeFromConstructorParamsMock,
      ).toHaveBeenCalledExactlyOnceWith(
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

      resolveInstanceBindingConstructorParamsMock.mockResolvedValue(
        constructorResolvedValues,
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
      vitest.clearAllMocks();
    });

    it('should call resolveInstanceBindingConstructorParams()', () => {
      expect(
        resolveInstanceBindingConstructorParamsMock,
      ).toHaveBeenCalledExactlyOnceWith(paramsFixture, nodeFixture);
    });

    it('should call resolveInstanceBindingNodeAsyncFromConstructorParams()', () => {
      expect(
        resolveInstanceBindingNodeAsyncFromConstructorParamsMock,
      ).toHaveBeenCalledExactlyOnceWith(
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
