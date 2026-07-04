import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { PlanSingleBindingServiceNodeFixtures } from '../../planning/fixtures/PlanSingleBindingServiceNodeFixtures.js';
import { type InstanceBindingNode } from '../../planning/models/InstanceBindingNode.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveInstanceBindingConstructorParams } from './resolveInstanceBindingConstructorParams.js';

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
    let constructorParamMock: Mocked<PlanServiceNode>;

    let paramsFixture: ResolutionParams;
    let nodeFixture: InstanceBindingNode<unknown, InstanceBinding<unknown>>;

    beforeAll(() => {
      constructorParamMock = {
        ...PlanSingleBindingServiceNodeFixtures.withBindingsUndefined,
        resolve: vitest.fn(),
        serviceIdentifier: 'service-id',
      };
      paramsFixture = Symbol() as unknown as ResolutionParams;
      nodeFixture = {
        constructorParams: [constructorParamMock],
      } as Partial<
        InstanceBindingNode<unknown, InstanceBinding<unknown>>
      > as InstanceBindingNode<unknown, InstanceBinding<unknown>>;
    });

    describe('when called, and resolveServiceNode() return non Promise value', () => {
      let resolvedValue: unknown;

      let result: unknown;

      beforeAll(() => {
        resolvedValue = Symbol();

        constructorParamMock.resolve.mockReturnValueOnce(resolvedValue);

        result = resolveInstanceBindingConstructorParams(
          paramsFixture,
          nodeFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call constructorParam.resolve()', () => {
        expect(constructorParamMock.resolve).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
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

        vitest
          .mocked(constructorParamMock.resolve)
          .mockResolvedValueOnce(resolvedValue);

        result = resolveInstanceBindingConstructorParams(
          paramsFixture,
          nodeFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call constructorParam.resolve()', () => {
        expect(constructorParamMock.resolve).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
        );
      });

      it('should return expected value', () => {
        expect(result).toStrictEqual(Promise.resolve([resolvedValue]));
      });
    });
  });
});
