import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

vitest.mock(import('./cacheResolvedValue.js'));

import { InstanceBindingFixtures } from '../../binding/fixtures/InstanceBindingFixtures.js';
import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved } from '../models/Resolved.js';
import { cacheResolvedValue } from './cacheResolvedValue.js';
import { resolveScopedWithNoActivations } from './resolveScopedWithNoActivations.js';

describe(resolveScopedWithNoActivations, () => {
  describe('having a binding with scope Singleton and no cache', () => {
    let bindingFixture: InstanceBinding<unknown>;

    beforeAll(() => {
      bindingFixture =
        InstanceBindingFixtures.withCacheIsRightFalseAndScopeSingleton;
    });

    describe('when called', () => {
      let resolveMock: Mock<(params: ResolutionParams) => Resolved<unknown>>;

      let resolveFunction: (params: ResolutionParams) => Resolved<unknown>;

      beforeAll(() => {
        resolveMock = vitest.fn();

        resolveFunction = resolveScopedWithNoActivations(
          bindingFixture,
          resolveMock,
        );
      });

      describe('when resolveFunction is called', () => {
        let paramsFixture: ResolutionParams;
        let resolveMockResult: unknown;

        let result: unknown;

        beforeAll(() => {
          paramsFixture = Symbol() as unknown as ResolutionParams;
          resolveMockResult = Symbol();

          resolveMock.mockReturnValueOnce(resolveMockResult);

          vitest
            .mocked(cacheResolvedValue)
            .mockReturnValueOnce(resolveMockResult);

          result = resolveFunction(paramsFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call resolveMock()', () => {
          expect(resolveMock).toHaveBeenCalledExactlyOnceWith(paramsFixture);
        });

        it('should call cacheResolvedValue()', () => {
          expect(cacheResolvedValue).toHaveBeenCalledExactlyOnceWith(
            bindingFixture,
            resolveMockResult,
          );
        });

        it('should return expected value', () => {
          expect(result).toBe(resolveMockResult);
        });
      });
    });
  });

  describe('having a binding with scope Singleton and cache', () => {
    let bindingFixture: InstanceBinding<unknown>;

    beforeAll(() => {
      bindingFixture =
        InstanceBindingFixtures.withCacheIsRightAndScopeSingleton;
    });

    describe('when called', () => {
      let resolveMock: Mock<(params: ResolutionParams) => Resolved<unknown>>;

      let resolveFunction: (params: ResolutionParams) => Resolved<unknown>;

      beforeAll(() => {
        resolveMock = vitest.fn();

        resolveFunction = resolveScopedWithNoActivations(
          bindingFixture,
          resolveMock,
        );
      });

      describe('when resolveFunction is called', () => {
        let paramsFixture: ResolutionParams;

        let result: unknown;

        beforeAll(() => {
          paramsFixture = Symbol() as unknown as ResolutionParams;

          result = resolveFunction(paramsFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should not call resolveMock()', () => {
          expect(resolveMock).not.toHaveBeenCalled();
        });

        it('should not call cacheResolvedValue()', () => {
          expect(cacheResolvedValue).not.toHaveBeenCalled();
        });

        it('should return expected value', () => {
          expect(result).toBe(bindingFixture.cache.value);
        });
      });
    });
  });

  describe('having a binding with scope Request', () => {
    let bindingFixture: InstanceBinding<unknown>;

    beforeAll(() => {
      bindingFixture = InstanceBindingFixtures.withScopeRequest;
    });

    describe('when called', () => {
      let resolveMock: Mock<(params: ResolutionParams) => Resolved<unknown>>;

      let resolveFunction: (params: ResolutionParams) => Resolved<unknown>;

      beforeAll(() => {
        resolveMock = vitest.fn();

        resolveFunction = resolveScopedWithNoActivations(
          bindingFixture,
          resolveMock,
        );
      });

      describe('when resolveFunction is called, and params.requestScopeCache does not have a value for the binding', () => {
        let paramsFixture: ResolutionParams;
        let resolveMockResult: unknown;

        let result: unknown;

        beforeAll(() => {
          paramsFixture = {
            requestScopeCache: new Map(),
          } as Partial<ResolutionParams> as ResolutionParams;
          resolveMockResult = Symbol();

          resolveMock.mockReturnValueOnce(resolveMockResult);

          result = resolveFunction(paramsFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call resolveMock()', () => {
          expect(resolveMock).toHaveBeenCalledExactlyOnceWith(paramsFixture);
        });

        it('should set request scope value()', () => {
          expect(paramsFixture.requestScopeCache?.get(bindingFixture.id)).toBe(
            resolveMockResult,
          );
        });

        it('should return expected value', () => {
          expect(result).toBe(resolveMockResult);
        });
      });

      describe('when resolveFunction is called, and params.requestScopeCache is undefined', () => {
        let paramsFixture: ResolutionParams;
        let resolveMockResult: unknown;

        let result: unknown;

        beforeAll(() => {
          paramsFixture = {
            requestScopeCache: undefined,
          } as Partial<ResolutionParams> as ResolutionParams;
          resolveMockResult = Symbol();

          resolveMock.mockReturnValueOnce(resolveMockResult);

          result = resolveFunction(paramsFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call resolveMock()', () => {
          expect(resolveMock).toHaveBeenCalledExactlyOnceWith(paramsFixture);
        });

        it('should lazily create the request scope cache and set the value', () => {
          expect(paramsFixture.requestScopeCache?.get(bindingFixture.id)).toBe(
            resolveMockResult,
          );
        });

        it('should return expected value', () => {
          expect(result).toBe(resolveMockResult);
        });
      });

      describe('when resolveFunction is called, and params.requestScopeCache has a value for the binding', () => {
        let paramsFixture: ResolutionParams;
        let requestScopeCacheResult: unknown;

        let result: unknown;

        beforeAll(() => {
          requestScopeCacheResult = Symbol();
          paramsFixture = {
            requestScopeCache: new Map([
              [bindingFixture.id, requestScopeCacheResult],
            ]),
          } as Partial<ResolutionParams> as ResolutionParams;

          result = resolveFunction(paramsFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should not call resolveMock()', () => {
          expect(resolveMock).not.toHaveBeenCalled();
        });

        it('should return expected value', () => {
          expect(result).toBe(requestScopeCacheResult);
        });
      });
    });
  });

  describe('having a binding with scope Transient', () => {
    let bindingFixture: InstanceBinding<unknown>;

    beforeAll(() => {
      bindingFixture = InstanceBindingFixtures.withScopeTransient;
    });

    describe('when called', () => {
      let resolveMock: Mock<(params: ResolutionParams) => Resolved<unknown>>;

      let resolveFunction: (params: ResolutionParams) => Resolved<unknown>;

      beforeAll(() => {
        resolveMock = vitest.fn();

        resolveFunction = resolveScopedWithNoActivations(
          bindingFixture,
          resolveMock,
        );
      });

      it('should return the resolve function itself', () => {
        expect(resolveFunction).toBe(resolveMock);
      });

      describe('when resolveFunction is called', () => {
        let paramsFixture: ResolutionParams;
        let resolveMockResult: unknown;

        let result: unknown;

        beforeAll(() => {
          paramsFixture = Symbol() as unknown as ResolutionParams;
          resolveMockResult = Symbol();

          resolveMock.mockReturnValueOnce(resolveMockResult);

          result = resolveFunction(paramsFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call resolveMock()', () => {
          expect(resolveMock).toHaveBeenCalledExactlyOnceWith(paramsFixture);
        });

        it('should return expected value', () => {
          expect(result).toBe(resolveMockResult);
        });
      });
    });
  });
});
