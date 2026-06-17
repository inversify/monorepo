import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('./resolveResolvedValueBindingParams.js'));

import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolvedValueBindingNode } from '../../planning/models/ResolvedValueBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveResolvedValueBindingNode } from './resolveResolvedValueBindingNode.js';
import { resolveResolvedValueBindingParams } from './resolveResolvedValueBindingParams.js';

describe(resolveResolvedValueBindingNode, () => {
  let paramsFixture: ResolutionParams;
  let nodeMock: Mocked<ResolvedValueBindingNode>;

  beforeAll(() => {
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

      vitest
        .mocked(resolveResolvedValueBindingParams)
        .mockReturnValue(constructorResolvedValues);

      vitest
        .mocked(nodeMock.binding.factory)
        .mockReturnValueOnce(instanceResolvedValue);

      result = resolveResolvedValueBindingNode(paramsFixture, nodeMock);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call resolveResolvedValueBindingParams()', () => {
      expect(resolveResolvedValueBindingParams).toHaveBeenCalledExactlyOnceWith(
        paramsFixture,
        nodeMock,
      );
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

      vitest
        .mocked(resolveResolvedValueBindingParams)
        .mockResolvedValue(constructorResolvedValues);

      vitest
        .mocked(nodeMock.binding.factory)
        .mockResolvedValueOnce(instanceResolvedValue);

      result = await resolveResolvedValueBindingNode(paramsFixture, nodeMock);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call resolveResolvedValueBindingParams()', () => {
      expect(resolveResolvedValueBindingParams).toHaveBeenCalledExactlyOnceWith(
        paramsFixture,
        nodeMock,
      );
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
