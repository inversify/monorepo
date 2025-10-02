import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

vitest.mock('./cacheResolvedValue');
vitest.mock('./resolveBindingActivations');

import { Right } from '@inversifyjs/common';

import { bindingScopeValues } from '../../binding/models/BindingScope';
import {
  BindingType,
  bindingTypeValues,
} from '../../binding/models/BindingType';
import { ScopedBinding } from '../../binding/models/ScopedBinding';
import { ResolutionParams } from '../models/ResolutionParams';
import { cacheResolvedValue } from './cacheResolvedValue';
import { resolveBindingActivations } from './resolveBindingActivations';
import { resolveSingletonScopedBinding } from './resolveSingletonScopedBinding';

describe(resolveSingletonScopedBinding, () => {
  describe('having a binding with cache.isRight equals to true', () => {
    let resolutionParamsFixture: ResolutionParams;
    let bindingFixture: ScopedBinding<
      BindingType,
      typeof bindingScopeValues.Singleton,
      unknown
    >;

    let resolveMock: Mock<
      (
        params: ResolutionParams,
        binding: ScopedBinding<
          BindingType,
          typeof bindingScopeValues.Singleton,
          unknown
        >,
      ) => unknown
    >;

    beforeAll(() => {
      resolutionParamsFixture = Symbol() as unknown as ResolutionParams;
      bindingFixture = {
        cache: {
          isRight: true,
          value: Symbol(),
        },
        id: 1,
        isSatisfiedBy: () => true,
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: 'service-id',
        type: bindingTypeValues.ConstantValue,
      };

      resolveMock = vitest.fn();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveSingletonScopedBinding(resolveMock)(
          resolutionParamsFixture,
          bindingFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return cached value', () => {
        expect(result).toBe((bindingFixture.cache as Right<unknown>).value);
      });
    });
  });

  describe('having a binding with cache.isRight equals to false', () => {
    let resolutionParamsFixture: ResolutionParams;
    let bindingFixture: ScopedBinding<
      BindingType,
      typeof bindingScopeValues.Singleton,
      unknown
    >;

    let resolveMock: Mock<
      (
        params: ResolutionParams,
        binding: ScopedBinding<
          BindingType,
          typeof bindingScopeValues.Singleton,
          unknown
        >,
      ) => unknown
    >;

    beforeAll(() => {
      resolutionParamsFixture = Symbol() as unknown as ResolutionParams;
      bindingFixture = {
        cache: {
          isRight: false,
          value: undefined,
        },
        id: 1,
        isSatisfiedBy: () => true,
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: 'service-id',
        type: bindingTypeValues.ConstantValue,
      };

      resolveMock = vitest.fn();
    });

    describe('when called', () => {
      let resolveResult: unknown;
      let activatedResolveResult: unknown;

      let result: unknown;

      beforeAll(() => {
        resolveResult = Symbol();
        activatedResolveResult = Symbol();

        resolveMock.mockReturnValueOnce(resolveResult);
        vitest
          .mocked(resolveBindingActivations)
          .mockReturnValueOnce(activatedResolveResult);

        vitest
          .mocked(cacheResolvedValue)
          .mockReturnValueOnce(activatedResolveResult);

        result = resolveSingletonScopedBinding(resolveMock)(
          resolutionParamsFixture,
          bindingFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolve()', () => {
        expect(resolveMock).toHaveBeenCalledExactlyOnceWith(
          resolutionParamsFixture,
          bindingFixture,
        );
      });

      it('should call resolveBindingActivations()', () => {
        expect(resolveBindingActivations).toHaveBeenCalledExactlyOnceWith(
          resolutionParamsFixture,
          bindingFixture,
          resolveResult,
        );
      });

      it('should call cacheResolvedValue()', () => {
        expect(cacheResolvedValue).toHaveBeenCalledExactlyOnceWith(
          bindingFixture,
          activatedResolveResult,
        );
      });

      it('should return cached value', () => {
        expect(result).toBe(activatedResolveResult);
      });
    });
  });
});
