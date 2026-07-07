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
vitest.mock(import('./resolveBindingActivations.js'));

import { InstanceBindingFixtures } from '../../binding/fixtures/InstanceBindingFixtures.js';
import { type bindingTypeValues } from '../../binding/models/BindingType.js';
import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type BaseBindingNode } from '../../planning/models/BaseBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved } from '../models/Resolved.js';
import { cacheResolvedValue } from './cacheResolvedValue.js';
import { resolveBindingActivations } from './resolveBindingActivations.js';
import { resolveScoped } from './resolveScoped.js';

describe(resolveScoped, () => {
  describe('having a node with a binding with scope Singleton and no cache', () => {
    let nodeFixture: BaseBindingNode<InstanceBinding<unknown>>;

    beforeAll(() => {
      nodeFixture = {
        binding: InstanceBindingFixtures.withCacheIsRightFalseAndScopeSingleton,
      };
    });

    describe('when called', () => {
      let resolveMock: Mock<
        (
          params: ResolutionParams,
          node: BaseBindingNode<InstanceBinding<unknown>>,
        ) => Resolved<unknown>
      >;

      let resolveFunction: (params: ResolutionParams) => Resolved<unknown>;

      beforeAll(() => {
        resolveMock = vitest.fn();

        resolveFunction = resolveScoped<
          unknown,
          typeof bindingTypeValues.Instance,
          InstanceBinding<unknown>,
          BaseBindingNode<InstanceBinding<unknown>>
        >(nodeFixture, resolveMock);
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
            .mocked(resolveBindingActivations)
            .mockReturnValueOnce(resolveMockResult);

          vitest
            .mocked(cacheResolvedValue)
            .mockReturnValueOnce(resolveMockResult);

          result = resolveFunction(paramsFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call resolveMock()', () => {
          expect(resolveMock).toHaveBeenCalledExactlyOnceWith(
            paramsFixture,
            nodeFixture,
          );
        });

        it('should call resolveBindingActivations()', () => {
          expect(resolveBindingActivations).toHaveBeenCalledExactlyOnceWith(
            paramsFixture,
            nodeFixture.binding,
            resolveMockResult,
          );
        });

        it('should call cacheResolvedValue()', () => {
          expect(cacheResolvedValue).toHaveBeenCalledExactlyOnceWith(
            nodeFixture.binding,
            resolveMockResult,
          );
        });

        it('should return expected value', () => {
          expect(result).toBe(resolveMockResult);
        });
      });
    });
  });

  describe('having a node with a binding with scope Singleton and cache', () => {
    let nodeFixture: BaseBindingNode<InstanceBinding<unknown>>;

    beforeAll(() => {
      nodeFixture = {
        binding: InstanceBindingFixtures.withCacheIsRightAndScopeSingleton,
      };
    });

    describe('when called', () => {
      let resolveMock: Mock<
        (
          params: ResolutionParams,
          node: BaseBindingNode<InstanceBinding<unknown>>,
        ) => Resolved<unknown>
      >;

      let resolveFunction: (params: ResolutionParams) => Resolved<unknown>;

      beforeAll(() => {
        resolveMock = vitest.fn();

        resolveFunction = resolveScoped<
          unknown,
          typeof bindingTypeValues.Instance,
          InstanceBinding<unknown>,
          BaseBindingNode<InstanceBinding<unknown>>
        >(nodeFixture, resolveMock);
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

        it('should not call resolveBindingActivations()', () => {
          expect(resolveBindingActivations).not.toHaveBeenCalled();
        });

        it('should not call cacheResolvedValue()', () => {
          expect(cacheResolvedValue).not.toHaveBeenCalled();
        });

        it('should return expected value', () => {
          expect(result).toBe(nodeFixture.binding.cache.value);
        });
      });
    });
  });

  describe('having a node with a binding with scope Request', () => {
    let nodeFixture: BaseBindingNode<InstanceBinding<unknown>>;

    beforeAll(() => {
      nodeFixture = {
        binding: InstanceBindingFixtures.withScopeRequest,
      };
    });

    describe('when called', () => {
      let resolveMock: Mock<
        (
          params: ResolutionParams,
          node: BaseBindingNode<InstanceBinding<unknown>>,
        ) => Resolved<unknown>
      >;

      let resolveFunction: (params: ResolutionParams) => Resolved<unknown>;

      beforeAll(() => {
        resolveMock = vitest.fn();

        resolveFunction = resolveScoped<
          unknown,
          typeof bindingTypeValues.Instance,
          InstanceBinding<unknown>,
          BaseBindingNode<InstanceBinding<unknown>>
        >(nodeFixture, resolveMock);
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

          vitest
            .mocked(resolveBindingActivations)
            .mockReturnValueOnce(resolveMockResult);

          result = resolveFunction(paramsFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call resolveMock()', () => {
          expect(resolveMock).toHaveBeenCalledExactlyOnceWith(
            paramsFixture,
            nodeFixture,
          );
        });

        it('should call resolveBindingActivations()', () => {
          expect(resolveBindingActivations).toHaveBeenCalledExactlyOnceWith(
            paramsFixture,
            nodeFixture.binding,
            resolveMockResult,
          );
        });

        it('should set request scope value()', () => {
          expect(
            paramsFixture.requestScopeCache?.get(nodeFixture.binding.id),
          ).toBe(resolveMockResult);
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

          vitest
            .mocked(resolveBindingActivations)
            .mockReturnValueOnce(resolveMockResult);

          result = resolveFunction(paramsFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call resolveMock()', () => {
          expect(resolveMock).toHaveBeenCalledExactlyOnceWith(
            paramsFixture,
            nodeFixture,
          );
        });

        it('should call resolveBindingActivations()', () => {
          expect(resolveBindingActivations).toHaveBeenCalledExactlyOnceWith(
            paramsFixture,
            nodeFixture.binding,
            resolveMockResult,
          );
        });

        it('should lazily create the request scope cache and set the value', () => {
          expect(
            paramsFixture.requestScopeCache?.get(nodeFixture.binding.id),
          ).toBe(resolveMockResult);
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
              [nodeFixture.binding.id, requestScopeCacheResult],
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

        it('should not call resolveBindingActivations()', () => {
          expect(resolveBindingActivations).not.toHaveBeenCalled();
        });

        it('should return expected value', () => {
          expect(result).toBe(requestScopeCacheResult);
        });
      });
    });
  });

  describe('having a node with a binding with scope Transient', () => {
    let nodeFixture: BaseBindingNode<InstanceBinding<unknown>>;

    beforeAll(() => {
      nodeFixture = {
        binding: InstanceBindingFixtures.withScopeTransient,
      };
    });

    describe('when called', () => {
      let resolveMock: Mock<
        (
          params: ResolutionParams,
          node: BaseBindingNode<InstanceBinding<unknown>>,
        ) => Resolved<unknown>
      >;

      let resolveFunction: (params: ResolutionParams) => Resolved<unknown>;

      beforeAll(() => {
        resolveMock = vitest.fn();

        resolveFunction = resolveScoped<
          unknown,
          typeof bindingTypeValues.Instance,
          InstanceBinding<unknown>,
          BaseBindingNode<InstanceBinding<unknown>>
        >(nodeFixture, resolveMock);
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
            .mocked(resolveBindingActivations)
            .mockReturnValueOnce(resolveMockResult);

          result = resolveFunction(paramsFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call resolveMock()', () => {
          expect(resolveMock).toHaveBeenCalledExactlyOnceWith(
            paramsFixture,
            nodeFixture,
          );
        });

        it('should call resolveBindingActivations()', () => {
          expect(resolveBindingActivations).toHaveBeenCalledExactlyOnceWith(
            paramsFixture,
            nodeFixture.binding,
            resolveMockResult,
          );
        });

        it('should return expected value', () => {
          expect(result).toBe(resolveMockResult);
        });
      });
    });
  });
});
