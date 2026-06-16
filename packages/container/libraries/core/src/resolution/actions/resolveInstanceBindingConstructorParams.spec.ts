import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./resolveServiceNode.js'));

import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type InstanceBindingNode } from '../../planning/models/InstanceBindingNode.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveInstanceBindingConstructorParams } from './resolveInstanceBindingConstructorParams.js';
import { resolveServiceNode } from './resolveServiceNode.js';

describe(resolveInstanceBindingConstructorParams, () => {
  describe('having InstanceBindingNode with constructor param with undefined value', () => {
    let paramsFixture: ResolutionParams;
    let nodeFixture: InstanceBindingNode<unknown, InstanceBinding<unknown>>;

    beforeAll(() => {
      paramsFixture = Symbol() as unknown as ResolutionParams;
      nodeFixture = {
        constructorParams: [undefined],
      } as Partial<
        InstanceBindingNode<unknown, InstanceBinding<unknown>>
      > as InstanceBindingNode<unknown, InstanceBinding<unknown>>;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveInstanceBindingConstructorParams(
          paramsFixture,
          nodeFixture,
        );
      });

      it('should return expected value', () => {
        expect(result).toStrictEqual([undefined]);
      });
    });
  });

  describe('having InstanceBindingNode with constructor param with PlanServiceNode value', () => {
    let constructorParamFixture: PlanServiceNode;

    let paramsFixture: ResolutionParams;
    let nodeFixture: InstanceBindingNode<unknown, InstanceBinding<unknown>>;

    beforeAll(() => {
      constructorParamFixture = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: 'service-id',
      };
      paramsFixture = Symbol() as unknown as ResolutionParams;
      nodeFixture = {
        constructorParams: [constructorParamFixture],
      } as Partial<
        InstanceBindingNode<unknown, InstanceBinding<unknown>>
      > as InstanceBindingNode<unknown, InstanceBinding<unknown>>;
    });

    describe('when called, and resolveServiceNode() return non Promise value', () => {
      let resolvedValue: unknown;

      let result: unknown;

      beforeAll(() => {
        resolvedValue = Symbol();

        vitest.mocked(resolveServiceNode).mockReturnValueOnce(resolvedValue);

        result = resolveInstanceBindingConstructorParams(
          paramsFixture,
          nodeFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveServiceNode()', () => {
        expect(resolveServiceNode).toHaveBeenCalledExactlyOnceWith(
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

        vitest.mocked(resolveServiceNode).mockResolvedValueOnce(resolvedValue);

        result = resolveInstanceBindingConstructorParams(
          paramsFixture,
          nodeFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveServiceNode()', () => {
        expect(resolveServiceNode).toHaveBeenCalledExactlyOnceWith(
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
