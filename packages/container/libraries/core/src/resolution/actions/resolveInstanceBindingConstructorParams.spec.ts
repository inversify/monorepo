import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type InstanceBindingNode } from '../../planning/models/InstanceBindingNode.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveInstanceBindingConstructorParams } from './resolveInstanceBindingConstructorParams.js';

describe(resolveInstanceBindingConstructorParams, () => {
  describe('having InstanceBindingNode with constructor param with undefined value', () => {
    let resolveServiceNodeMock: Mock<
      (params: ResolutionParams, serviceNode: PlanServiceNode) => unknown
    >;

    let paramsFixture: ResolutionParams;
    let nodeFixture: InstanceBindingNode<InstanceBinding<unknown>>;

    beforeAll(() => {
      resolveServiceNodeMock = vitest.fn();
      paramsFixture = Symbol() as unknown as ResolutionParams;
      nodeFixture = {
        constructorParams: [undefined],
      } as Partial<
        InstanceBindingNode<InstanceBinding<unknown>>
      > as InstanceBindingNode<InstanceBinding<unknown>>;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveInstanceBindingConstructorParams(
          resolveServiceNodeMock,
        )(paramsFixture, nodeFixture);
      });

      it('should return expected value', () => {
        expect(result).toStrictEqual([undefined]);
      });
    });
  });

  describe('having InstanceBindingNode with constructor param with PlanServiceNode value', () => {
    let constructorParamFixture: PlanServiceNode;
    let resolveServiceNodeMock: Mock<
      (params: ResolutionParams, serviceNode: PlanServiceNode) => unknown
    >;

    let paramsFixture: ResolutionParams;
    let nodeFixture: InstanceBindingNode<InstanceBinding<unknown>>;

    beforeAll(() => {
      constructorParamFixture = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: 'service-id',
      };
      resolveServiceNodeMock = vitest.fn();
      paramsFixture = Symbol() as unknown as ResolutionParams;
      nodeFixture = {
        constructorParams: [constructorParamFixture],
      } as Partial<
        InstanceBindingNode<InstanceBinding<unknown>>
      > as InstanceBindingNode<InstanceBinding<unknown>>;
    });

    describe('when called, and resolveServiceNode() return non Promise value', () => {
      let resolvedValue: unknown;

      let result: unknown;

      beforeAll(() => {
        resolvedValue = Symbol();

        resolveServiceNodeMock.mockReturnValueOnce(resolvedValue);

        result = resolveInstanceBindingConstructorParams(
          resolveServiceNodeMock,
        )(paramsFixture, nodeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveServiceNode()', () => {
        expect(resolveServiceNodeMock).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
          constructorParamFixture,
        );
      });

      it('should return expected value', () => {
        expect(result).toStrictEqual([resolvedValue]);
      });
    });

    describe('when called, and resolveServiceNode() return Promise value', () => {
      let resolvedValue: unknown;

      let result: unknown;

      beforeAll(() => {
        resolvedValue = Symbol();

        resolveServiceNodeMock.mockResolvedValueOnce(resolvedValue);

        result = resolveInstanceBindingConstructorParams(
          resolveServiceNodeMock,
        )(paramsFixture, nodeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveServiceNode()', () => {
        expect(resolveServiceNodeMock).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
          constructorParamFixture,
        );
      });

      it('should return expected value', () => {
        expect(result).toStrictEqual(Promise.resolve([resolvedValue]));
      });
    });
  });
});
