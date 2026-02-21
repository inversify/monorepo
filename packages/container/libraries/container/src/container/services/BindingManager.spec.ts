import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('@inversifyjs/core'));

import { type ServiceIdentifier } from '@inversifyjs/common';
import {
  type ActivationsService,
  type Binding,
  type BindingConstraints,
  type BindingScope,
  bindingScopeValues,
  type BindingService,
  bindingTypeValues,
  CacheBindingInvalidationKind,
  type DeactivationParams,
  type DeactivationsService,
  type GetOptionsTagConstraint,
  type PlanResultCacheService,
  resolveBindingsDeactivations,
  resolveServiceDeactivations,
} from '@inversifyjs/core';

import { type BindToFluentSyntax } from '../../binding/models/BindingFluentSyntax.js';
import { BindToFluentSyntaxImplementation } from '../../binding/models/BindingFluentSyntaxImplementation.js';
import {
  type BindingIdentifier,
  bindingIdentifierSymbol,
} from '../../binding/models/BindingIdentifier.js';
import { InversifyContainerError } from '../../error/models/InversifyContainerError.js';
import { InversifyContainerErrorKind } from '../../error/models/InversifyContainerErrorKind.js';
import { type CacheBindingInvalidation } from '../models/CacheBindingInvalidation.js';
import { BindingManager } from './BindingManager.js';
import { type PlanResultCacheManager } from './PlanResultCacheManager.js';
import { type ServiceReferenceManager } from './ServiceReferenceManager.js';

describe(BindingManager, () => {
  let deactivationParamsFixture: DeactivationParams;
  let defaultScopeFixture: BindingScope;
  let planResultCacheManagerMock: Mocked<PlanResultCacheManager>;
  let serviceReferenceManagerMock: Mocked<ServiceReferenceManager>;

  beforeAll(() => {
    deactivationParamsFixture = Symbol() as unknown as DeactivationParams;
    defaultScopeFixture = bindingScopeValues.Transient;
    planResultCacheManagerMock = {
      invalidateService: vitest.fn(),
    } as Partial<
      Mocked<PlanResultCacheManager>
    > as Mocked<PlanResultCacheManager>;
    serviceReferenceManagerMock = {
      activationService: {
        removeAllByServiceId: vitest.fn(),
      } as Partial<ActivationsService>,
      bindingService: {
        get: vitest.fn(),
        getById: vitest.fn(),
        getNonParentBindings: vitest.fn(),
        getNonParentBoundServices: vitest.fn(),
        removeAllByServiceId: vitest.fn(),
        removeById: vitest.fn(),
      } as Partial<BindingService>,
      deactivationService: {
        removeAllByServiceId: vitest.fn(),
      } as Partial<DeactivationsService>,
      planResultCacheService: {
        clearCache: vitest.fn(),
        invalidateServiceBinding: vitest.fn(),
      } as Partial<PlanResultCacheService>,
    } as Partial<
      Mocked<ServiceReferenceManager>
    > as Mocked<ServiceReferenceManager>;
  });

  describe('.bind', () => {
    describe('when called', () => {
      let serviceIdentifierFixture: ServiceIdentifier;

      let result: unknown;

      beforeAll(() => {
        serviceIdentifierFixture = 'service-id';

        result = new BindingManager(
          deactivationParamsFixture,
          defaultScopeFixture,
          planResultCacheManagerMock,
          serviceReferenceManagerMock,
        ).bind(serviceIdentifierFixture);
      });

      it('should return BindToFluentSyntax', () => {
        const expected: BindToFluentSyntax<unknown> =
          new BindToFluentSyntaxImplementation(
            expect.any(Function) as unknown as (
              binding: Binding<unknown>,
            ) => void,
            undefined,
            defaultScopeFixture,
            serviceIdentifierFixture,
          );

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('.isBound', () => {
    let serviceIdentifierFixture: ServiceIdentifier;

    let nameFixture: string;
    let tagFixture: GetOptionsTagConstraint;

    beforeAll(() => {
      serviceIdentifierFixture = 'service-id';

      nameFixture = 'name-fixture';
      tagFixture = {
        key: 'tag-key-fixture',
        value: Symbol(),
      };
    });

    describe('when called, and bindingService.get() returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        result = new BindingManager(
          deactivationParamsFixture,
          defaultScopeFixture,
          planResultCacheManagerMock,
          serviceReferenceManagerMock,
        ).isBound(serviceIdentifierFixture, {
          name: nameFixture,
          tag: tagFixture,
        });
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingService.get()', () => {
        expect(
          serviceReferenceManagerMock.bindingService.get,
        ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });

    describe('when called, and bindingService.get() returns binding ann binding.isSatisfiedBy() returns false', () => {
      let bindingMock: Mocked<Binding>;

      let result: unknown;

      beforeAll(() => {
        bindingMock = {
          cache: {
            isRight: false,
            value: undefined,
          },
          id: 1,
          isSatisfiedBy: vitest.fn(),
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: 'service-id',
          type: bindingTypeValues.ConstantValue,
          value: Symbol.for('constant-value-binding-fixture-value'),
        };

        vitest
          .mocked(serviceReferenceManagerMock.bindingService)
          .get.mockReturnValueOnce([bindingMock]);

        bindingMock.isSatisfiedBy.mockReturnValueOnce(false);

        result = new BindingManager(
          deactivationParamsFixture,
          defaultScopeFixture,
          planResultCacheManagerMock,
          serviceReferenceManagerMock,
        ).isBound(serviceIdentifierFixture, {
          name: nameFixture,
          tag: tagFixture,
        });
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingService.get()', () => {
        expect(
          serviceReferenceManagerMock.bindingService.get,
        ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
      });

      it('should call binding.isSatisfiedBy()', () => {
        const expectedBindingConstraints: BindingConstraints = {
          getAncestor: expect.any(Function) as unknown as () =>
            | BindingConstraints
            | undefined,
          name: nameFixture,
          serviceIdentifier: serviceIdentifierFixture,
          tags: new Map([[tagFixture.key, tagFixture.value]]),
        };

        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledExactlyOnceWith(
          expectedBindingConstraints,
        );
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });

    describe('when called, and bindingService.get() returns binding ann binding.isSatisfiedBy() returns true', () => {
      let bindingMock: Mocked<Binding>;

      let result: unknown;

      beforeAll(() => {
        bindingMock = {
          cache: {
            isRight: false,
            value: undefined,
          },
          id: 1,
          isSatisfiedBy: vitest.fn(),
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: 'service-id',
          type: bindingTypeValues.ConstantValue,
          value: Symbol.for('constant-value-binding-fixture-value'),
        };

        vitest
          .mocked(serviceReferenceManagerMock.bindingService)
          .get.mockReturnValueOnce([bindingMock]);

        bindingMock.isSatisfiedBy.mockReturnValueOnce(true);

        result = new BindingManager(
          deactivationParamsFixture,
          defaultScopeFixture,
          planResultCacheManagerMock,
          serviceReferenceManagerMock,
        ).isBound(serviceIdentifierFixture, {
          name: nameFixture,
          tag: tagFixture,
        });
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingService.get()', () => {
        expect(
          serviceReferenceManagerMock.bindingService.get,
        ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
      });

      it('should call binding.isSatisfiedBy()', () => {
        const expectedBindingConstraints: BindingConstraints = {
          getAncestor: expect.any(Function) as unknown as () =>
            | BindingConstraints
            | undefined,
          name: nameFixture,
          serviceIdentifier: serviceIdentifierFixture,
          tags: new Map([[tagFixture.key, tagFixture.value]]),
        };

        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledExactlyOnceWith(
          expectedBindingConstraints,
        );
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });
  });

  describe('.isCurrentBound', () => {
    let serviceIdentifierFixture: ServiceIdentifier;
    let nameFixture: string;
    let tagFixture: GetOptionsTagConstraint;

    beforeAll(() => {
      serviceIdentifierFixture = 'service-id';
      nameFixture = 'name-fixture';
      tagFixture = {
        key: 'tag-key-fixture',
        value: Symbol(),
      };
    });

    describe('when called, and bindingService.getNonParentBindings() returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(serviceReferenceManagerMock.bindingService)
          .getNonParentBindings.mockReturnValueOnce(undefined);

        result = new BindingManager(
          deactivationParamsFixture,
          defaultScopeFixture,
          planResultCacheManagerMock,
          serviceReferenceManagerMock,
        ).isCurrentBound(serviceIdentifierFixture, {
          name: nameFixture,
          tag: tagFixture,
        });
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingService.getNonParentBindings()', () => {
        expect(
          serviceReferenceManagerMock.bindingService.getNonParentBindings,
        ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });

    describe('when called, and bindingService.getNonParentBindings() returns bindings and binding.isSatisfiedBy() returns false', () => {
      let bindingMock: Mocked<Binding>;

      let result: unknown;

      beforeAll(() => {
        bindingMock = {
          cache: {
            isRight: false,
            value: undefined,
          },
          id: 1,
          isSatisfiedBy: vitest.fn(),
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: 'service-id',
          type: bindingTypeValues.ConstantValue,
          value: Symbol.for('constant-value-binding-fixture-value'),
        };

        vitest
          .mocked(serviceReferenceManagerMock.bindingService)
          .getNonParentBindings.mockReturnValueOnce([bindingMock]);

        bindingMock.isSatisfiedBy.mockReturnValueOnce(false);

        result = new BindingManager(
          deactivationParamsFixture,
          defaultScopeFixture,
          planResultCacheManagerMock,
          serviceReferenceManagerMock,
        ).isCurrentBound(serviceIdentifierFixture, {
          name: nameFixture,
          tag: tagFixture,
        });
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingService.getNonParentBindings()', () => {
        expect(
          serviceReferenceManagerMock.bindingService.getNonParentBindings,
        ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
      });

      it('should call binding.isSatisfiedBy()', () => {
        const expectedBindingConstraints: BindingConstraints = {
          getAncestor: expect.any(Function) as unknown as () =>
            | BindingConstraints
            | undefined,
          name: nameFixture,
          serviceIdentifier: serviceIdentifierFixture,
          tags: new Map([[tagFixture.key, tagFixture.value]]),
        };

        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledExactlyOnceWith(
          expectedBindingConstraints,
        );
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });

    describe('when called, and bindingService.getNonParentBindings() returns bindings and binding.isSatisfiedBy() returns true', () => {
      let bindingMock: Mocked<Binding>;

      let result: unknown;

      beforeAll(() => {
        bindingMock = {
          cache: {
            isRight: false,
            value: undefined,
          },
          id: 1,
          isSatisfiedBy: vitest.fn(),
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: 'service-id',
          type: bindingTypeValues.ConstantValue,
          value: Symbol.for('constant-value-binding-fixture-value'),
        };

        vitest
          .mocked(serviceReferenceManagerMock.bindingService)
          .getNonParentBindings.mockReturnValueOnce([bindingMock]);

        bindingMock.isSatisfiedBy.mockReturnValueOnce(true);

        result = new BindingManager(
          deactivationParamsFixture,
          defaultScopeFixture,
          planResultCacheManagerMock,
          serviceReferenceManagerMock,
        ).isCurrentBound(serviceIdentifierFixture, {
          name: nameFixture,
          tag: tagFixture,
        });
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingService.getNonParentBindings()', () => {
        expect(
          serviceReferenceManagerMock.bindingService.getNonParentBindings,
        ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
      });

      it('should call binding.isSatisfiedBy()', () => {
        const expectedBindingConstraints: BindingConstraints = {
          getAncestor: expect.any(Function) as unknown as () =>
            | BindingConstraints
            | undefined,
          name: nameFixture,
          serviceIdentifier: serviceIdentifierFixture,
          tags: new Map([[tagFixture.key, tagFixture.value]]),
        };

        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledExactlyOnceWith(
          expectedBindingConstraints,
        );
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });
  });

  describe('.rebindAsync', () => {
    describe('when called', () => {
      let bindingFixture: Binding<unknown>;
      let serviceIdentifierFixture: ServiceIdentifier;

      let result: unknown;

      beforeAll(async () => {
        bindingFixture = Symbol() as unknown as Binding<unknown>;
        serviceIdentifierFixture = 'service-id';

        vitest
          .mocked(serviceReferenceManagerMock.bindingService)
          .get.mockReturnValueOnce([bindingFixture]);

        result = await new BindingManager(
          deactivationParamsFixture,
          defaultScopeFixture,
          planResultCacheManagerMock,
          serviceReferenceManagerMock,
        ).rebindAsync(serviceIdentifierFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call serviceReferenceManager.bindingService.get()', () => {
        expect(
          serviceReferenceManagerMock.bindingService.get,
        ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
      });

      it('should call resolveBindingsDeactivations', () => {
        expect(resolveBindingsDeactivations).toHaveBeenCalledExactlyOnceWith(
          deactivationParamsFixture,
          [bindingFixture],
        );
      });

      it('should call activationService.removeAllByServiceId()', () => {
        expect(
          serviceReferenceManagerMock.activationService.removeAllByServiceId,
        ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
      });

      it('should call bindingService.removeAllByServiceId()', () => {
        expect(
          serviceReferenceManagerMock.bindingService.removeAllByServiceId,
        ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
      });

      it('should call deactivationService.removeAllByServiceId()', () => {
        expect(
          serviceReferenceManagerMock.deactivationService.removeAllByServiceId,
        ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
      });

      it('should call planResultCacheManager.invalidateService()', () => {
        const invalidation: CacheBindingInvalidation = {
          binding: bindingFixture,
          kind: CacheBindingInvalidationKind.bindingRemoved,
        };

        expect(
          planResultCacheManagerMock.invalidateService,
        ).toHaveBeenCalledExactlyOnceWith(invalidation);
      });

      it('should return BindToFluentSyntax', () => {
        const expected: BindToFluentSyntax<unknown> =
          new BindToFluentSyntaxImplementation(
            expect.any(Function) as unknown as (
              binding: Binding<unknown>,
            ) => void,
            undefined,
            bindingScopeValues.Singleton,
            serviceIdentifierFixture,
          );

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('.rebind', () => {
    describe('when called', () => {
      let bindingFixture: Binding<unknown>;
      let serviceIdentifierFixture: ServiceIdentifier;

      let result: unknown;

      beforeAll(async () => {
        bindingFixture = Symbol() as unknown as Binding<unknown>;
        serviceIdentifierFixture = 'service-id';

        vitest
          .mocked(serviceReferenceManagerMock.bindingService)
          .get.mockReturnValueOnce([bindingFixture]);

        result = new BindingManager(
          deactivationParamsFixture,
          defaultScopeFixture,
          planResultCacheManagerMock,
          serviceReferenceManagerMock,
        ).rebind(serviceIdentifierFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call serviceReferenceManager.bindingService.get()', () => {
        expect(
          serviceReferenceManagerMock.bindingService.get,
        ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
      });

      it('should call resolveBindingsDeactivations', () => {
        expect(resolveBindingsDeactivations).toHaveBeenCalledExactlyOnceWith(
          deactivationParamsFixture,
          [bindingFixture],
        );
      });

      it('should call activationService.removeAllByServiceId()', () => {
        expect(
          serviceReferenceManagerMock.activationService.removeAllByServiceId,
        ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
      });

      it('should call bindingService.removeAllByServiceId()', () => {
        expect(
          serviceReferenceManagerMock.bindingService.removeAllByServiceId,
        ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
      });

      it('should call deactivationService.removeAllByServiceId()', () => {
        expect(
          serviceReferenceManagerMock.deactivationService.removeAllByServiceId,
        ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
      });

      it('should call serviceReferenceManager.invalidateService()', () => {
        const invalidation: CacheBindingInvalidation = {
          binding: bindingFixture,
          kind: CacheBindingInvalidationKind.bindingRemoved,
        };

        expect(
          planResultCacheManagerMock.invalidateService,
        ).toHaveBeenCalledExactlyOnceWith(invalidation);
      });

      it('should return BindToFluentSyntax', () => {
        const expected: BindToFluentSyntax<unknown> =
          new BindToFluentSyntaxImplementation(
            expect.any(Function) as unknown as (
              binding: Binding<unknown>,
            ) => void,
            undefined,
            bindingScopeValues.Singleton,
            serviceIdentifierFixture,
          );

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('.unbindAsync', () => {
    describe('having a ServiceIdentifier', () => {
      let serviceIdentifierFixture: ServiceIdentifier;

      beforeAll(() => {
        serviceIdentifierFixture = 'serviceId';
      });

      describe('when called', () => {
        let bindingFixture: Binding<unknown>;
        let result: unknown;

        beforeAll(async () => {
          bindingFixture = Symbol() as unknown as Binding<unknown>;

          vitest
            .mocked(serviceReferenceManagerMock.bindingService)
            .get.mockReturnValueOnce([bindingFixture]);

          result = await new BindingManager(
            deactivationParamsFixture,
            defaultScopeFixture,
            planResultCacheManagerMock,
            serviceReferenceManagerMock,
          ).unbindAsync(serviceIdentifierFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call serviceReferenceManager.bindingService.get()', () => {
          expect(
            serviceReferenceManagerMock.bindingService.get,
          ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
        });

        it('should call resolveBindingsDeactivations', () => {
          expect(resolveBindingsDeactivations).toHaveBeenCalledExactlyOnceWith(
            deactivationParamsFixture,
            [bindingFixture],
          );
        });

        it('should call activationService.removeAllByServiceId()', () => {
          expect(
            serviceReferenceManagerMock.activationService.removeAllByServiceId,
          ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
        });

        it('should call bindingService.removeAllByServiceId()', () => {
          expect(
            serviceReferenceManagerMock.bindingService.removeAllByServiceId,
          ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
        });

        it('should call deactivationService.removeAllByServiceId()', () => {
          expect(
            serviceReferenceManagerMock.deactivationService
              .removeAllByServiceId,
          ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
        });

        it('should call serviceReferenceManager.invalidateService()', () => {
          const invalidation: CacheBindingInvalidation = {
            binding: bindingFixture,
            kind: CacheBindingInvalidationKind.bindingRemoved,
          };

          expect(
            planResultCacheManagerMock.invalidateService,
          ).toHaveBeenCalledExactlyOnceWith(invalidation);
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });

      describe('when called, and resolveServiceDeactivations() returns Promise', () => {
        let bindingFixture: Binding<unknown>;

        let result: unknown;

        beforeAll(async () => {
          bindingFixture = Symbol() as unknown as Binding<unknown>;

          vitest
            .mocked(serviceReferenceManagerMock.bindingService)
            .get.mockReturnValueOnce([bindingFixture]);

          vitest
            .mocked(resolveBindingsDeactivations)
            .mockResolvedValueOnce(undefined);

          result = await new BindingManager(
            deactivationParamsFixture,
            defaultScopeFixture,
            planResultCacheManagerMock,
            serviceReferenceManagerMock,
          ).unbindAsync(serviceIdentifierFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call serviceReferenceManager.bindingService.get()', () => {
          expect(
            serviceReferenceManagerMock.bindingService.get,
          ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
        });

        it('should call resolveBindingsDeactivations', () => {
          expect(resolveBindingsDeactivations).toHaveBeenCalledExactlyOnceWith(
            deactivationParamsFixture,
            [bindingFixture],
          );
        });

        it('should call activationService.removeAllByServiceId()', () => {
          expect(
            serviceReferenceManagerMock.activationService.removeAllByServiceId,
          ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
        });

        it('should call bindingService.removeAllByServiceId()', () => {
          expect(
            serviceReferenceManagerMock.bindingService.removeAllByServiceId,
          ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
        });

        it('should call deactivationService.removeAllByServiceId()', () => {
          expect(
            serviceReferenceManagerMock.deactivationService
              .removeAllByServiceId,
          ).toHaveBeenCalledExactlyOnceWith(serviceIdentifierFixture);
        });

        it('should call serviceReferenceManager.invalidateService()', () => {
          const invalidation: CacheBindingInvalidation = {
            binding: bindingFixture,
            kind: CacheBindingInvalidationKind.bindingRemoved,
          };

          expect(
            planResultCacheManagerMock.invalidateService,
          ).toHaveBeenCalledExactlyOnceWith(invalidation);
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });

    describe('having a BindingIdentifier', () => {
      let bindingIdentifierFixture: BindingIdentifier;

      beforeAll(() => {
        bindingIdentifierFixture = {
          [bindingIdentifierSymbol]: true,
          id: 1,
        };
      });

      describe('when called', () => {
        let bindingMock: Mocked<Binding<unknown>>;

        let result: unknown;

        beforeAll(async () => {
          bindingMock = {
            cache: {
              isRight: false,
              value: undefined,
            },
            id: bindingIdentifierFixture.id,
            isSatisfiedBy: vitest.fn(),
            moduleId: undefined,
            onActivation: undefined,
            onDeactivation: undefined,
            scope: bindingScopeValues.Singleton,
            serviceIdentifier: 'service-id',
            type: bindingTypeValues.ConstantValue,
            value: Symbol.for('constant-value-binding-fixture-value'),
          };

          vitest
            .mocked(serviceReferenceManagerMock.bindingService)
            .getById.mockReturnValueOnce([bindingMock]);

          result = await new BindingManager(
            deactivationParamsFixture,
            defaultScopeFixture,
            planResultCacheManagerMock,
            serviceReferenceManagerMock,
          ).unbindAsync(bindingIdentifierFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call bindingService.getById()', () => {
          expect(
            serviceReferenceManagerMock.bindingService.getById,
          ).toHaveBeenCalledExactlyOnceWith(bindingIdentifierFixture.id);
        });

        it('should call resolveBindingsDeactivations()', () => {
          expect(resolveBindingsDeactivations).toHaveBeenCalledExactlyOnceWith(
            deactivationParamsFixture,
            [bindingMock],
          );
        });

        it('should call bindingService.removeById()', () => {
          expect(
            serviceReferenceManagerMock.bindingService.removeById,
          ).toHaveBeenCalledExactlyOnceWith(bindingIdentifierFixture.id);
        });

        it('should call serviceReferenceManager.invalidateService()', () => {
          const invalidation: CacheBindingInvalidation = {
            binding: bindingMock,
            kind: CacheBindingInvalidationKind.bindingRemoved,
          };

          expect(
            planResultCacheManagerMock.invalidateService,
          ).toHaveBeenCalledExactlyOnceWith(invalidation);
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });

      describe('when called, and resolveBindingsDeactivations() returns a Promise', () => {
        let bindingMock: Mocked<Binding<unknown>>;
        let result: unknown;

        beforeAll(async () => {
          bindingMock = {
            cache: {
              isRight: false,
              value: undefined,
            },
            id: bindingIdentifierFixture.id,
            isSatisfiedBy: vitest.fn(),
            moduleId: undefined,
            onActivation: undefined,
            onDeactivation: undefined,
            scope: bindingScopeValues.Singleton,
            serviceIdentifier: 'service-id',
            type: bindingTypeValues.ConstantValue,
            value: Symbol.for('constant-value-binding-fixture-value'),
          };

          vitest
            .mocked(serviceReferenceManagerMock.bindingService)
            .getById.mockReturnValueOnce([bindingMock]);

          vitest
            .mocked(resolveBindingsDeactivations)
            .mockResolvedValueOnce(undefined);

          result = await new BindingManager(
            deactivationParamsFixture,
            defaultScopeFixture,
            planResultCacheManagerMock,
            serviceReferenceManagerMock,
          ).unbindAsync(bindingIdentifierFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call bindingService.getById()', () => {
          expect(
            serviceReferenceManagerMock.bindingService.getById,
          ).toHaveBeenCalledExactlyOnceWith(bindingIdentifierFixture.id);
        });

        it('should call resolveBindingsDeactivations()', () => {
          expect(resolveBindingsDeactivations).toHaveBeenCalledExactlyOnceWith(
            deactivationParamsFixture,
            [bindingMock],
          );
        });

        it('should call bindingService.removeById()', () => {
          expect(
            serviceReferenceManagerMock.bindingService.removeById,
          ).toHaveBeenCalledExactlyOnceWith(bindingIdentifierFixture.id);
        });

        it('should call serviceReferenceManager.bindingService.getById()', () => {
          expect(
            serviceReferenceManagerMock.bindingService.getById,
          ).toHaveBeenCalledExactlyOnceWith(bindingIdentifierFixture.id);
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });
  });

  describe('.unbindAll', () => {
    describe('when called, and all deactivations are synchronous', () => {
      let serviceIdsFixture: string[];
      let result: unknown;

      beforeAll(async () => {
        serviceIdsFixture = ['service1', 'service2'];
        vitest
          .mocked(serviceReferenceManagerMock.bindingService)
          .getNonParentBoundServices.mockReturnValueOnce(serviceIdsFixture);

        vitest.mocked(resolveServiceDeactivations).mockReturnValue(undefined);

        result = await new BindingManager(
          deactivationParamsFixture,
          defaultScopeFixture,
          planResultCacheManagerMock,
          serviceReferenceManagerMock,
        ).unbindAllAsync();
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveServiceDeactivations for each service', () => {
        expect(resolveServiceDeactivations).toHaveBeenCalledTimes(
          serviceIdsFixture.length,
        );

        for (const serviceId of serviceIdsFixture) {
          expect(resolveServiceDeactivations).toHaveBeenCalledWith(
            deactivationParamsFixture,
            serviceId,
          );
        }
      });

      it('should call removeAllByServiceId on activationService for each service', () => {
        expect(
          serviceReferenceManagerMock.activationService.removeAllByServiceId,
        ).toHaveBeenCalledTimes(serviceIdsFixture.length);

        for (const serviceId of serviceIdsFixture) {
          expect(
            serviceReferenceManagerMock.activationService.removeAllByServiceId,
          ).toHaveBeenCalledWith(serviceId);
        }
      });

      it('should call removeAllByServiceId on bindingService for each service', () => {
        expect(
          serviceReferenceManagerMock.bindingService.removeAllByServiceId,
        ).toHaveBeenCalledTimes(serviceIdsFixture.length);

        for (const serviceId of serviceIdsFixture) {
          expect(
            serviceReferenceManagerMock.bindingService.removeAllByServiceId,
          ).toHaveBeenCalledWith(serviceId);
        }
      });

      it('should call removeAllByServiceId on deactivationService for each service', () => {
        expect(
          serviceReferenceManagerMock.deactivationService.removeAllByServiceId,
        ).toHaveBeenCalledTimes(serviceIdsFixture.length);

        for (const serviceId of serviceIdsFixture) {
          expect(
            serviceReferenceManagerMock.deactivationService
              .removeAllByServiceId,
          ).toHaveBeenCalledWith(serviceId);
        }
      });

      it('should call planResultCacheService.clearCache()', () => {
        expect(
          serviceReferenceManagerMock.planResultCacheService.clearCache,
        ).toHaveBeenCalledExactlyOnceWith();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called, and at least one deactivation is asynchronous', () => {
      let serviceIdsFixture: string[];
      let result: unknown;

      beforeAll(async () => {
        serviceIdsFixture = ['service1', 'service2'];
        vitest
          .mocked(serviceReferenceManagerMock.bindingService)
          .getNonParentBoundServices.mockReturnValueOnce(serviceIdsFixture);

        vitest
          .mocked(resolveServiceDeactivations)
          .mockReturnValueOnce(undefined)
          .mockResolvedValueOnce(undefined);

        result = await new BindingManager(
          deactivationParamsFixture,
          defaultScopeFixture,
          planResultCacheManagerMock,
          serviceReferenceManagerMock,
        ).unbindAllAsync();
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveServiceDeactivations for each service', () => {
        expect(resolveServiceDeactivations).toHaveBeenCalledTimes(
          serviceIdsFixture.length,
        );

        for (const serviceId of serviceIdsFixture) {
          expect(resolveServiceDeactivations).toHaveBeenCalledWith(
            deactivationParamsFixture,
            serviceId,
          );
        }
      });

      it('should call removeAllByServiceId on activationService for each service', () => {
        expect(
          serviceReferenceManagerMock.activationService.removeAllByServiceId,
        ).toHaveBeenCalledTimes(serviceIdsFixture.length);

        for (const serviceId of serviceIdsFixture) {
          expect(
            serviceReferenceManagerMock.activationService.removeAllByServiceId,
          ).toHaveBeenCalledWith(serviceId);
        }
      });

      it('should call removeAllByServiceId on bindingService for each service', () => {
        expect(
          serviceReferenceManagerMock.bindingService.removeAllByServiceId,
        ).toHaveBeenCalledTimes(serviceIdsFixture.length);

        for (const serviceId of serviceIdsFixture) {
          expect(
            serviceReferenceManagerMock.bindingService.removeAllByServiceId,
          ).toHaveBeenCalledWith(serviceId);
        }
      });

      it('should call removeAllByServiceId on deactivationService for each service', () => {
        expect(
          serviceReferenceManagerMock.deactivationService.removeAllByServiceId,
        ).toHaveBeenCalledTimes(serviceIdsFixture.length);

        for (const serviceId of serviceIdsFixture) {
          expect(
            serviceReferenceManagerMock.deactivationService
              .removeAllByServiceId,
          ).toHaveBeenCalledWith(serviceId);
        }
      });

      it('should call planResultCacheService.clearCache()', () => {
        expect(
          serviceReferenceManagerMock.planResultCacheService.clearCache,
        ).toHaveBeenCalledExactlyOnceWith();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.unbindAllSync', () => {
    describe('when called, and all deactivations are synchronous', () => {
      let serviceIdsFixture: string[];
      let result: unknown;

      beforeAll(() => {
        serviceIdsFixture = ['service1', 'service2'];
        vitest
          .mocked(serviceReferenceManagerMock.bindingService)
          .getNonParentBoundServices.mockReturnValueOnce(serviceIdsFixture);

        vitest.mocked(resolveServiceDeactivations).mockReturnValue(undefined);

        result = new BindingManager(
          deactivationParamsFixture,
          defaultScopeFixture,
          planResultCacheManagerMock,
          serviceReferenceManagerMock,
        ).unbindAll();
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveServiceDeactivations for each service', () => {
        expect(resolveServiceDeactivations).toHaveBeenCalledTimes(
          serviceIdsFixture.length,
        );

        for (const serviceId of serviceIdsFixture) {
          expect(resolveServiceDeactivations).toHaveBeenCalledWith(
            deactivationParamsFixture,
            serviceId,
          );
        }
      });

      it('should call removeAllByServiceId on activationService for each service', () => {
        expect(
          serviceReferenceManagerMock.activationService.removeAllByServiceId,
        ).toHaveBeenCalledTimes(serviceIdsFixture.length);

        for (const serviceId of serviceIdsFixture) {
          expect(
            serviceReferenceManagerMock.activationService.removeAllByServiceId,
          ).toHaveBeenCalledWith(serviceId);
        }
      });

      it('should call removeAllByServiceId on bindingService for each service', () => {
        expect(
          serviceReferenceManagerMock.bindingService.removeAllByServiceId,
        ).toHaveBeenCalledTimes(serviceIdsFixture.length);

        for (const serviceId of serviceIdsFixture) {
          expect(
            serviceReferenceManagerMock.bindingService.removeAllByServiceId,
          ).toHaveBeenCalledWith(serviceId);
        }
      });

      it('should call removeAllByServiceId on deactivationService for each service', () => {
        expect(
          serviceReferenceManagerMock.deactivationService.removeAllByServiceId,
        ).toHaveBeenCalledTimes(serviceIdsFixture.length);

        for (const serviceId of serviceIdsFixture) {
          expect(
            serviceReferenceManagerMock.deactivationService
              .removeAllByServiceId,
          ).toHaveBeenCalledWith(serviceId);
        }
      });

      it('should call planResultCacheService.clearCache()', () => {
        expect(
          serviceReferenceManagerMock.planResultCacheService.clearCache,
        ).toHaveBeenCalledExactlyOnceWith();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called, and at least one deactivation is asynchronous', () => {
      let serviceIdsFixture: string[];

      beforeAll(() => {
        serviceIdsFixture = ['service1', 'service2'];
      });

      describe('when called', () => {
        let error: unknown;

        beforeAll(() => {
          vitest
            .mocked(serviceReferenceManagerMock.bindingService)
            .getNonParentBoundServices.mockReturnValueOnce(serviceIdsFixture);

          vitest
            .mocked(resolveServiceDeactivations)
            .mockReturnValueOnce(undefined)
            .mockResolvedValueOnce(undefined);

          try {
            new BindingManager(
              deactivationParamsFixture,
              defaultScopeFixture,
              planResultCacheManagerMock,
              serviceReferenceManagerMock,
            ).unbindAll();
          } catch (e) {
            error = e;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should throw an InversifyContainerError', () => {
          const expected: Partial<InversifyContainerError> = {
            kind: InversifyContainerErrorKind.invalidOperation,
            message:
              'Unexpected asynchronous deactivation when unbinding all services. Consider using Container.unbindAllAsync() instead.',
          };

          expect(error).toBeInstanceOf(InversifyContainerError);
          expect(error).toMatchObject(expected);
        });
      });
    });
  });
});
