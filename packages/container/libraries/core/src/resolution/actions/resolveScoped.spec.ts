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

vitest.mock('./cacheResolvedValue');
vitest.mock('./resolveBindingActivations');

import { Right } from '@inversifyjs/common';

import {
  BindingScope,
  bindingScopeValues,
} from '../../binding/models/BindingScope';
import {
  BindingType,
  bindingTypeValues,
} from '../../binding/models/BindingType';
import { ScopedBinding } from '../../binding/models/ScopedBinding';
import { ResolutionParams } from '../models/ResolutionParams';
import { cacheResolvedValue } from './cacheResolvedValue';
import { resolveBindingActivations } from './resolveBindingActivations';
import { resolveScoped } from './resolveScoped';

describe(resolveScoped, () => {
  let getBindingMock: Mock<
    (arg: unknown) => ScopedBinding<BindingType, BindingScope, unknown>
  >;

  let paramsMock: Mocked<ResolutionParams>;
  let argFixture: unknown;
  let resolveMock: Mock<(params: ResolutionParams, arg: unknown) => unknown>;

  beforeAll(() => {
    getBindingMock = vitest.fn();

    paramsMock = {
      requestScopeCache: {
        get: vitest.fn(),
        has: vitest.fn(),
        set: vitest.fn() as unknown,
      } as Partial<Mocked<Map<number, unknown>>> as Mocked<
        Map<number, unknown>
      >,
    } as Partial<Mocked<ResolutionParams>> as Mocked<ResolutionParams>;

    argFixture = Symbol();

    resolveMock = vitest.fn();
  });

  describe('when called, and getBinding() returns singleton scoped binding with cache', () => {
    let bindingFixture: ScopedBinding<
      BindingType,
      typeof bindingScopeValues.Singleton,
      unknown
    >;

    let result: unknown;

    beforeAll(() => {
      bindingFixture = bindingFixture = {
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

      getBindingMock.mockReturnValueOnce(bindingFixture);

      result = resolveScoped(getBindingMock, resolveMock)(
        paramsMock,
        argFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getBinding()', () => {
      expect(getBindingMock).toHaveBeenCalledExactlyOnceWith(argFixture);
    });

    it('should return expected result', () => {
      expect(result).toBe((bindingFixture.cache as Right<unknown>).value);
    });
  });

  describe('when called, and getBinding() returns singleton scoped binding with no cache', () => {
    let bindingFixture: ScopedBinding<
      BindingType,
      typeof bindingScopeValues.Singleton,
      unknown
    >;

    let resolveResult: unknown;
    let activatedResolveResult: unknown;

    let result: unknown;

    beforeAll(() => {
      bindingFixture = bindingFixture = {
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

      resolveResult = Symbol();
      activatedResolveResult = Symbol();

      getBindingMock.mockReturnValueOnce(bindingFixture);

      resolveMock.mockReturnValueOnce(resolveResult);
      vitest
        .mocked(resolveBindingActivations)
        .mockReturnValueOnce(activatedResolveResult);

      vitest
        .mocked(cacheResolvedValue)
        .mockReturnValueOnce(activatedResolveResult);

      result = resolveScoped(getBindingMock, resolveMock)(
        paramsMock,
        argFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getBinding()', () => {
      expect(getBindingMock).toHaveBeenCalledExactlyOnceWith(argFixture);
    });

    it('should call resolve()', () => {
      expect(resolveMock).toHaveBeenCalledExactlyOnceWith(
        paramsMock,
        argFixture,
      );
    });

    it('should call resolveBindingActivations()', () => {
      expect(resolveBindingActivations).toHaveBeenCalledExactlyOnceWith(
        paramsMock,
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

    it('should return expected result', () => {
      expect(result).toBe(activatedResolveResult);
    });
  });

  describe('when called, and getBinding() returns request scoped binding, and requestScopeCache.has() returns true', () => {
    let bindingFixture: ScopedBinding<
      BindingType,
      typeof bindingScopeValues.Request,
      unknown
    >;

    let resolveResult: unknown;

    let result: unknown;

    beforeAll(() => {
      bindingFixture = bindingFixture = {
        cache: {
          isRight: false,
          value: undefined,
        },
        id: 1,
        isSatisfiedBy: () => true,
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Request,
        serviceIdentifier: 'service-id',
        type: bindingTypeValues.ConstantValue,
      };

      resolveResult = Symbol();

      getBindingMock.mockReturnValueOnce(bindingFixture);

      vitest.mocked(paramsMock.requestScopeCache.has).mockReturnValueOnce(true);
      vitest
        .mocked(paramsMock.requestScopeCache.get)
        .mockReturnValueOnce(resolveResult);

      result = resolveScoped(getBindingMock, resolveMock)(
        paramsMock,
        argFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getBinding()', () => {
      expect(getBindingMock).toHaveBeenCalledExactlyOnceWith(argFixture);
    });

    it('should call params.requestScopeCache.has()', () => {
      expect(paramsMock.requestScopeCache.has).toHaveBeenCalledExactlyOnceWith(
        bindingFixture.id,
      );
    });

    it('should call params.requestScopeCache.get()', () => {
      expect(paramsMock.requestScopeCache.get).toHaveBeenCalledExactlyOnceWith(
        bindingFixture.id,
      );
    });

    it('should return expected result', () => {
      expect(result).toBe(resolveResult);
    });
  });

  describe('when called, and getBinding() returns request scoped binding, and requestScopeCache.has() returns false', () => {
    let bindingFixture: ScopedBinding<
      BindingType,
      typeof bindingScopeValues.Request,
      unknown
    >;

    let resolveResult: unknown;
    let activatedResolveResult: unknown;

    let result: unknown;

    beforeAll(() => {
      bindingFixture = bindingFixture = {
        cache: {
          isRight: false,
          value: undefined,
        },
        id: 1,
        isSatisfiedBy: () => true,
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Request,
        serviceIdentifier: 'service-id',
        type: bindingTypeValues.ConstantValue,
      };

      resolveResult = Symbol();
      activatedResolveResult = Symbol();

      getBindingMock.mockReturnValueOnce(bindingFixture);

      resolveMock.mockReturnValueOnce(resolveResult);
      vitest
        .mocked(resolveBindingActivations)
        .mockReturnValueOnce(activatedResolveResult);

      vitest
        .mocked(paramsMock.requestScopeCache.has)
        .mockReturnValueOnce(false);

      result = resolveScoped(getBindingMock, resolveMock)(
        paramsMock,
        argFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getBinding()', () => {
      expect(getBindingMock).toHaveBeenCalledExactlyOnceWith(argFixture);
    });

    it('should call params.requestScopeCache.has()', () => {
      expect(paramsMock.requestScopeCache.has).toHaveBeenCalledExactlyOnceWith(
        bindingFixture.id,
      );
    });

    it('should call resolve()', () => {
      expect(resolveMock).toHaveBeenCalledExactlyOnceWith(
        paramsMock,
        argFixture,
      );
    });

    it('should call resolveBindingActivations()', () => {
      expect(resolveBindingActivations).toHaveBeenCalledExactlyOnceWith(
        paramsMock,
        bindingFixture,
        resolveResult,
      );
    });

    it('should call params.requestScopeCache.set()', () => {
      expect(paramsMock.requestScopeCache.set).toHaveBeenCalledExactlyOnceWith(
        bindingFixture.id,
        activatedResolveResult,
      );
    });

    it('should return expected result', () => {
      expect(result).toBe(activatedResolveResult);
    });
  });

  describe('when called, and getBinding() returns transient scoped binding', () => {
    let bindingFixture: ScopedBinding<
      BindingType,
      typeof bindingScopeValues.Transient,
      unknown
    >;

    let resolveResult: unknown;
    let activatedResolveResult: unknown;

    let result: unknown;

    beforeAll(() => {
      bindingFixture = bindingFixture = {
        cache: {
          isRight: false,
          value: undefined,
        },
        id: 1,
        isSatisfiedBy: () => true,
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Transient,
        serviceIdentifier: 'service-id',
        type: bindingTypeValues.ConstantValue,
      };

      resolveResult = Symbol();
      activatedResolveResult = Symbol();

      getBindingMock.mockReturnValueOnce(bindingFixture);

      resolveMock.mockReturnValueOnce(resolveResult);
      vitest
        .mocked(resolveBindingActivations)
        .mockReturnValueOnce(activatedResolveResult);

      result = resolveScoped(getBindingMock, resolveMock)(
        paramsMock,
        argFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getBinding()', () => {
      expect(getBindingMock).toHaveBeenCalledExactlyOnceWith(argFixture);
    });

    it('should call resolve()', () => {
      expect(resolveMock).toHaveBeenCalledExactlyOnceWith(
        paramsMock,
        argFixture,
      );
    });

    it('should call resolveBindingActivations()', () => {
      expect(resolveBindingActivations).toHaveBeenCalledExactlyOnceWith(
        paramsMock,
        bindingFixture,
        resolveResult,
      );
    });

    it('should return expected result', () => {
      expect(result).toBe(activatedResolveResult);
    });
  });
});
