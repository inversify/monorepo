import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  Mocked,
  vitest,
} from 'vitest';

import { ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding';
import { ResolvedValueBindingNode } from '../../planning/models/ResolvedValueBindingNode';
import { ResolutionParams } from '../models/ResolutionParams';
import { resolveResolvedValueBindingNode } from './resolveResolvedValueBindingNode';

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
