import {
  isPromise,
  ServiceIdentifier,
  stringifyServiceIdentifier,
} from '@inversifyjs/common';
import {
  Binding,
  BindingConstraints,
  BindingScope,
  CacheBindingInvalidationKind,
  DeactivationParams,
  resolveBindingsDeactivations,
  resolveServiceDeactivations,
} from '@inversifyjs/core';

import { isBindingIdentifier } from '../../binding/calculations/isBindingIdentifier';
import { BindToFluentSyntax } from '../../binding/models/BindingFluentSyntax';
import { BindToFluentSyntaxImplementation } from '../../binding/models/BindingFluentSyntaxImplementation';
import { BindingIdentifier } from '../../binding/models/BindingIdentifier';
import { getFirstIterableResult } from '../../common/calculations/getFirstIterableResult';
import { InversifyContainerError } from '../../error/models/InversifyContainerError';
import { InversifyContainerErrorKind } from '../../error/models/InversifyContainerErrorKind';
import { IsBoundOptions } from '../models/isBoundOptions';
import { PlanResultCacheManager } from './PlanResultCacheManager';
import { ServiceReferenceManager } from './ServiceReferenceManager';

export class BindingManager {
  readonly #deactivationParams: DeactivationParams;
  readonly #defaultScope: BindingScope;
  readonly #planResultCacheManager: PlanResultCacheManager;
  readonly #serviceReferenceManager: ServiceReferenceManager;

  constructor(
    deactivationParams: DeactivationParams,
    defaultScope: BindingScope,
    planResultCacheManager: PlanResultCacheManager,
    serviceReferenceManager: ServiceReferenceManager,
  ) {
    this.#deactivationParams = deactivationParams;
    this.#defaultScope = defaultScope;
    this.#planResultCacheManager = planResultCacheManager;
    this.#serviceReferenceManager = serviceReferenceManager;
  }

  public bind<T>(
    serviceIdentifier: ServiceIdentifier<T>,
  ): BindToFluentSyntax<T> {
    return new BindToFluentSyntaxImplementation(
      (binding: Binding): void => {
        this.#setBinding(binding);
      },
      undefined,
      this.#defaultScope,
      serviceIdentifier,
    );
  }

  public isBound(
    serviceIdentifier: ServiceIdentifier,
    options?: IsBoundOptions,
  ): boolean {
    const bindings: Iterable<Binding<unknown>> | undefined =
      this.#serviceReferenceManager.bindingService.get(serviceIdentifier);

    return this.#isAnyValidBinding(serviceIdentifier, bindings, options);
  }

  public isCurrentBound(
    serviceIdentifier: ServiceIdentifier,
    options?: IsBoundOptions,
  ): boolean {
    const bindings: Iterable<Binding<unknown>> | undefined =
      this.#serviceReferenceManager.bindingService.getNonParentBindings(
        serviceIdentifier,
      );

    return this.#isAnyValidBinding(serviceIdentifier, bindings, options);
  }

  public async rebindAsync<T>(
    serviceIdentifier: ServiceIdentifier<T>,
  ): Promise<BindToFluentSyntax<T>> {
    await this.unbindAsync(serviceIdentifier);

    return this.bind(serviceIdentifier);
  }

  public rebind<T>(
    serviceIdentifier: ServiceIdentifier<T>,
  ): BindToFluentSyntax<T> {
    this.unbind(serviceIdentifier);

    return this.bind(serviceIdentifier);
  }

  public async unbindAsync(
    identifier: BindingIdentifier | ServiceIdentifier,
  ): Promise<void> {
    await this.#unbindAsync(identifier);
  }

  public async unbindAllAsync(): Promise<void> {
    await this.#unbindAll();
  }

  public unbindAll(): void {
    const result: void | Promise<void> = this.#unbindAll();

    if (result !== undefined) {
      throw new InversifyContainerError(
        InversifyContainerErrorKind.invalidOperation,
        'Unexpected asynchronous deactivation when unbinding all services. Consider using Container.unbindAllAsync() instead.',
      );
    }
  }

  public unbind(identifier: BindingIdentifier | ServiceIdentifier): void {
    const result: void | Promise<void> = this.#unbindAsync(identifier);

    if (result !== undefined) {
      this.#throwUnexpectedAsyncUnbindOperation(identifier);
    }
  }

  #setBinding(binding: Binding): void {
    this.#serviceReferenceManager.bindingService.set(binding);
    this.#planResultCacheManager.invalidateService({
      binding: binding as Binding<unknown>,
      kind: CacheBindingInvalidationKind.bindingAdded,
    });
  }

  #throwUnexpectedAsyncUnbindOperation(
    identifier: BindingIdentifier | ServiceIdentifier,
  ): never {
    let errorMessage: string;

    if (isBindingIdentifier(identifier)) {
      const bindingsById: Iterable<Binding<unknown>> | undefined =
        this.#serviceReferenceManager.bindingService.getById(identifier.id);

      const bindingServiceIdentifier: ServiceIdentifier | undefined =
        getFirstIterableResult(bindingsById)?.serviceIdentifier;

      if (bindingServiceIdentifier === undefined) {
        errorMessage =
          'Unexpected asynchronous deactivation when unbinding binding identifier. Consider using Container.unbindAsync() instead.';
      } else {
        errorMessage = `Unexpected asynchronous deactivation when unbinding "${stringifyServiceIdentifier(bindingServiceIdentifier)}" binding. Consider using Container.unbindAsync() instead.`;
      }
    } else {
      errorMessage = `Unexpected asynchronous deactivation when unbinding "${stringifyServiceIdentifier(identifier)}" service. Consider using Container.unbindAsync() instead.`;
    }

    throw new InversifyContainerError(
      InversifyContainerErrorKind.invalidOperation,
      errorMessage,
    );
  }

  #unbindAsync(
    identifier: BindingIdentifier | ServiceIdentifier,
  ): void | Promise<void> {
    if (isBindingIdentifier(identifier)) {
      return this.#unbindBindingIdentifier(identifier);
    }

    return this.#unbindServiceIdentifier(identifier);
  }

  #unbindBindingIdentifier(
    identifier: BindingIdentifier,
  ): void | Promise<void> {
    const bindingsIterable: Iterable<Binding<unknown>> | undefined =
      this.#serviceReferenceManager.bindingService.getById(identifier.id);
    const bindings: Binding<unknown>[] | undefined =
      bindingsIterable === undefined ? undefined : [...bindingsIterable];

    const result: void | Promise<void> = resolveBindingsDeactivations(
      this.#deactivationParams,
      bindingsIterable,
    );

    if (result === undefined) {
      this.#clearAfterUnbindBindingIdentifier(bindings, identifier);
    } else {
      return result.then((): void => {
        this.#clearAfterUnbindBindingIdentifier(bindings, identifier);
      });
    }
  }

  #clearAfterUnbindBindingIdentifier(
    bindings: Iterable<Binding<unknown>> | undefined,
    identifier: BindingIdentifier,
  ): void {
    this.#serviceReferenceManager.bindingService.removeById(identifier.id);

    if (bindings !== undefined) {
      for (const binding of bindings) {
        this.#planResultCacheManager.invalidateService({
          binding,
          kind: CacheBindingInvalidationKind.bindingRemoved,
        });
      }
    }
  }

  #unbindAll(): void | Promise<void> {
    const nonParentBoundServiceIds: ServiceIdentifier[] = [
      ...this.#serviceReferenceManager.bindingService.getNonParentBoundServices(),
    ];

    const deactivationResults: (void | Promise<void>)[] =
      nonParentBoundServiceIds.map(
        (serviceId: ServiceIdentifier): void | Promise<void> =>
          resolveServiceDeactivations(this.#deactivationParams, serviceId),
      );

    const hasAsyncDeactivations: boolean = deactivationResults.some(
      (result: void | Promise<void>): boolean => isPromise(result),
    );

    if (hasAsyncDeactivations) {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      return Promise.all(deactivationResults).then((): void => {
        this.#clearAfterUnbindAll(nonParentBoundServiceIds);
      });
    }

    this.#clearAfterUnbindAll(nonParentBoundServiceIds);
  }

  #clearAfterUnbindAll(serviceIds: ServiceIdentifier[]): void {
    /*
     * Removing service related objects here so unbindAll is deterministic.
     *
     * Removing service related objects as soon as resolveModuleDeactivations takes
     * effect leads to module deactivations not triggering previously deleted
     * deactivations, introducing non determinism depending in the order in which
     * services are deactivated.
     */
    for (const serviceId of serviceIds) {
      this.#serviceReferenceManager.activationService.removeAllByServiceId(
        serviceId,
      );
      this.#serviceReferenceManager.bindingService.removeAllByServiceId(
        serviceId,
      );
      this.#serviceReferenceManager.deactivationService.removeAllByServiceId(
        serviceId,
      );
    }

    this.#serviceReferenceManager.planResultCacheService.clearCache();
  }

  #unbindServiceIdentifier(
    identifier: ServiceIdentifier,
  ): void | Promise<void> {
    const bindingsIterable: Iterable<Binding<unknown>> | undefined =
      this.#serviceReferenceManager.bindingService.get(identifier);

    const bindings: Binding<unknown>[] | undefined =
      bindingsIterable === undefined ? undefined : [...bindingsIterable];

    const result: void | Promise<void> = resolveBindingsDeactivations(
      this.#deactivationParams,
      bindingsIterable,
    );

    if (result === undefined) {
      this.#clearAfterUnbindServiceIdentifier(identifier, bindings);
    } else {
      return result.then((): void => {
        this.#clearAfterUnbindServiceIdentifier(identifier, bindings);
      });
    }
  }

  #clearAfterUnbindServiceIdentifier(
    identifier: ServiceIdentifier,
    bindings: Iterable<Binding<unknown>> | undefined,
  ): void {
    this.#serviceReferenceManager.activationService.removeAllByServiceId(
      identifier,
    );
    this.#serviceReferenceManager.bindingService.removeAllByServiceId(
      identifier,
    );
    this.#serviceReferenceManager.deactivationService.removeAllByServiceId(
      identifier,
    );

    if (bindings !== undefined) {
      for (const binding of bindings) {
        this.#planResultCacheManager.invalidateService({
          binding,
          kind: CacheBindingInvalidationKind.bindingRemoved,
        });
      }
    }
  }

  #isAnyValidBinding(
    serviceIdentifier: ServiceIdentifier,
    bindings: Iterable<Binding<unknown>> | undefined,
    options?: IsBoundOptions,
  ): boolean {
    if (bindings === undefined) {
      return false;
    }

    const bindingConstraints: BindingConstraints = {
      getAncestor: () => undefined,
      name: options?.name,
      serviceIdentifier,
      tags: new Map(),
    };

    if (options?.tag !== undefined) {
      bindingConstraints.tags.set(options.tag.key, options.tag.value);
    }

    for (const binding of bindings) {
      if (binding.isSatisfiedBy(bindingConstraints)) {
        return true;
      }
    }

    return false;
  }
}
