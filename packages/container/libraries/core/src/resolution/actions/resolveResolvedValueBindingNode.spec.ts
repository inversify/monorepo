import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  type Mocked,
  vitest,
} from 'vitest';

import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolvedValueBindingNode } from '../../planning/models/ResolvedValueBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveResolvedValueBindingNode } from './resolveResolvedValueBindingNode.js';

describe(resolveResolvedValueBindingNode, () => {
  let resolveResolvedValueBindingParamsMock: Mock<
    (
      params: ResolutionParams,
      node: ResolvedValueBindingNode,
    ) => unknown[] | Promise<unknown[]>
  >;

  let paramsFixture: ResolutionParams;
  let nodeMock: Mocked<ResolvedValueBindingNode>;

  beforeAll(() => {
    resolveResolvedValueBindingParamsMock = vitest.fn();

    paramsFixture = Symbol() as unknown as ResolutionParams;
    nodeMock = {
      binding: {
        factory: vitest.fn(),
      } as Partial<Mocked<ResolvedValueBinding<unknown>>> as Mocked<
        ResolvedValueBinding<unknown>
      >,
    } as Partial<
      Mocked<ResolvedValueBindingNode>
    > as Mocked<ResolvedValueBindingNode>;
  });

  describe('when called, and resolveResolvedValueBindingParams() returns an array', () => {
    let constructorResolvedValues: unknown[];
    let instanceResolvedValue: unknown;

    let result: unknown;

    beforeAll(() => {
      constructorResolvedValues = [Symbol()];
      instanceResolvedValue = Symbol();

      resolveResolvedValueBindingParamsMock.mockReturnValue(
        constructorResolvedValues,
      );

      vitest
        .mocked(nodeMock.binding.factory)
        .mockReturnValueOnce(instanceResolvedValue);

      result = resolveResolvedValueBindingNode(
        resolveResolvedValueBindingParamsMock,
      )(paramsFixture, nodeMock);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call resolveResolvedValueBindingParams()', () => {
      expect(
        resolveResolvedValueBindingParamsMock,
      ).toHaveBeenCalledExactlyOnceWith(paramsFixture, nodeMock);
    });

    it('should call node.binding.factory()', () => {
      expect(nodeMock.binding.factory).toHaveBeenCalledExactlyOnceWith(
        ...constructorResolvedValues,
      );
    });

    it('should return expected result', () => {
      expect(result).toBe(instanceResolvedValue);
    });
  });

  describe('when called, and resolveResolvedValueBindingParams() returns an array promise', () => {
    let constructorResolvedValues: unknown[];
    let instanceResolvedValue: unknown;

    let result: unknown;

    beforeAll(async () => {
      constructorResolvedValues = [Symbol()];
      instanceResolvedValue = Symbol();

      resolveResolvedValueBindingParamsMock.mockResolvedValue(
        constructorResolvedValues,
      );

      vitest
        .mocked(nodeMock.binding.factory)
        .mockResolvedValueOnce(instanceResolvedValue);

      result = await resolveResolvedValueBindingNode(
        resolveResolvedValueBindingParamsMock,
      )(paramsFixture, nodeMock);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call resolveResolvedValueBindingParams()', () => {
      expect(
        resolveResolvedValueBindingParamsMock,
      ).toHaveBeenCalledExactlyOnceWith(paramsFixture, nodeMock);
    });

    it('should call node.binding.factory()', () => {
      expect(nodeMock.binding.factory).toHaveBeenCalledExactlyOnceWith(
        ...constructorResolvedValues,
      );
    });

    it('should return expected result', () => {
      expect(result).toBe(instanceResolvedValue);
    });
  });
});
