import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

vitest.mock('./resolveBindingDeactivations');

import { ConstantValueBindingFixtures } from '../../binding/fixtures/ConstantValueBindingFixtures';
import { Binding } from '../../binding/models/Binding';
import { DeactivationParams } from '../models/DeactivationParams';
import { resolveBindingDeactivations } from './resolveBindingDeactivations';
import { resolveBindingsDeactivations } from './resolveBindingsDeactivations';

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
