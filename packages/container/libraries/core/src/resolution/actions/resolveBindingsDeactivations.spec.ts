import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('./resolveBindingDeactivations.js'));

import { ConstantValueBindingFixtures } from '../../binding/fixtures/ConstantValueBindingFixtures.js';
import { type Binding } from '../../binding/models/Binding.js';
import { type DeactivationParams } from '../models/DeactivationParams.js';
import { resolveBindingDeactivations } from './resolveBindingDeactivations.js';
import { resolveBindingsDeactivations } from './resolveBindingsDeactivations.js';

describe(resolveBindingsDeactivations, () => {
  let paramsMock: Mocked<DeactivationParams>;

  beforeAll(() => {
    paramsMock = {
      getBindings: vitest.fn() as unknown,
      getClassMetadata: vitest.fn(),
      getDeactivations: vitest.fn(),
    } as Partial<Mocked<DeactivationParams>> as Mocked<DeactivationParams>;
  });

  describe('having undefined bindings', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveBindingsDeactivations(paramsMock, undefined);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having bindings with singleton ScopedBinding with no cached value', () => {
    let bindingsFixture: Iterable<Binding>;

    beforeAll(() => {
      bindingsFixture = [
        ConstantValueBindingFixtures.withCacheWithIsRightFalse,
      ];
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveBindingsDeactivations(paramsMock, bindingsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having bindings with singleton ScopedBinding with cached value', () => {
    let bindingFixture: Binding;
    let bindingsFixture: Iterable<Binding>;

    beforeAll(() => {
      bindingFixture = ConstantValueBindingFixtures.withCacheWithIsRightTrue;
      bindingsFixture = [bindingFixture];
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveBindingsDeactivations(paramsMock, bindingsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveBindingDeactivations()', () => {
        expect(resolveBindingDeactivations).toHaveBeenCalledExactlyOnceWith(
          paramsMock,
          bindingFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called, and resolveBindingDeactivations() returns Promise', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(resolveBindingDeactivations)
          .mockResolvedValueOnce(undefined);

        result = resolveBindingsDeactivations(paramsMock, bindingsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveBindingDeactivations()', () => {
        expect(resolveBindingDeactivations).toHaveBeenCalledExactlyOnceWith(
          paramsMock,
          bindingFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toStrictEqual(Promise.resolve(undefined));
      });
    });
  });
});
