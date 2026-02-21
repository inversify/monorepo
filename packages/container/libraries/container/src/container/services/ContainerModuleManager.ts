import { type ServiceIdentifier } from '@inversifyjs/common';
import {
  type Binding,
  type BindingActivation,
  type BindingDeactivation,
  type BindingScope,
  CacheBindingInvalidationKind,
  type DeactivationParams,
  resolveModuleDeactivations,
} from '@inversifyjs/core';

import { type BindToFluentSyntax } from '../../binding/models/BindingFluentSyntax.js';
import { BindToFluentSyntaxImplementation } from '../../binding/models/BindingFluentSyntaxImplementation.js';
import { InversifyContainerError } from '../../error/models/InversifyContainerError.js';
import { InversifyContainerErrorKind } from '../../error/models/InversifyContainerErrorKind.js';
import {
  type ContainerModule,
  type ContainerModuleLoadOptions,
} from '../models/ContainerModule.js';
import { type BindingManager } from './BindingManager.js';
import { type PlanResultCacheManager } from './PlanResultCacheManager.js';
import { type ServiceReferenceManager } from './ServiceReferenceManager.js';

export class ContainerModuleManager {
  readonly #bindingManager: BindingManager;
  readonly #deactivationParams: DeactivationParams;
  readonly #defaultScope: BindingScope;
  readonly #planResultCacheManager: PlanResultCacheManager;
  readonly #serviceReferenceManager: ServiceReferenceManager;

  constructor(
    bindingManager: BindingManager,
    deactivationParams: DeactivationParams,
    defaultScope: BindingScope,
    planResultCacheManager: PlanResultCacheManager,
    serviceReferenceManager: ServiceReferenceManager,
  ) {
    this.#bindingManager = bindingManager;
    this.#deactivationParams = deactivationParams;
    this.#defaultScope = defaultScope;
    this.#planResultCacheManager = planResultCacheManager;
    this.#serviceReferenceManager = serviceReferenceManager;
  }

  public async loadAsync(...modules: ContainerModule[]): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await Promise.all(this.#load(...modules));
  }

  public load(...modules: ContainerModule[]): void {
    const results: (void | Promise<void>)[] = this.#load(...modules);

    for (const result of results) {
      if (result !== undefined) {
        throw new InversifyContainerError(
          InversifyContainerErrorKind.invalidOperation,
          'Unexpected asynchronous module load. Consider using container.loadAsync() instead.',
        );
      }
    }
  }

  public async unloadAsync(...modules: ContainerModule[]): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await Promise.all(this.#unload(...modules));

    /*
     * Removing module related objects here so unload is deterministic.
     *
     * Removing modules as soon as resolveModuleDeactivations takes effect leads to
     * module deactivations not triggering previously deleted deactivations,
     * introducing non determinism depending in the order in which modules are
     * deactivated.
     */
    this.#clearAfterUnloadModules(modules);
  }

  public unload(...modules: ContainerModule[]): void {
    const results: (void | Promise<void>)[] = this.#unload(...modules);

    for (const result of results) {
      if (result !== undefined) {
        throw new InversifyContainerError(
          InversifyContainerErrorKind.invalidOperation,
          'Unexpected asynchronous module unload. Consider using container.unloadAsync() instead.',
        );
      }
    }

    /*
     * Removing module related objects here so unload is deterministic.
     *
     * Removing modules as soon as resolveModuleDeactivations takes effect leads to
     * module deactivations not triggering previously deleted deactivations,
     * introducing non determinism depending in the order in which modules are
     * deactivated.
     */
    this.#clearAfterUnloadModules(modules);
  }

  #buildContainerModuleLoadOptions(
    moduleId: number,
  ): ContainerModuleLoadOptions {
    return {
      bind: <T>(
        serviceIdentifier: ServiceIdentifier<T>,
      ): BindToFluentSyntax<T> => {
        return new BindToFluentSyntaxImplementation(
          (binding: Binding): void => {
            this.#setBinding(binding);
          },
          moduleId,
          this.#defaultScope,
          serviceIdentifier,
        );
      },
      isBound: this.#bindingManager.isBound.bind(this.#bindingManager),
      onActivation: <T>(
        serviceIdentifier: ServiceIdentifier<T>,
        activation: BindingActivation<T>,
      ): void => {
        this.#serviceReferenceManager.activationService.add(
          activation as BindingActivation,
          {
            moduleId,
            serviceId: serviceIdentifier,
          },
        );
      },
      onDeactivation: <T>(
        serviceIdentifier: ServiceIdentifier<T>,
        deactivation: BindingDeactivation<T>,
      ): void => {
        this.#serviceReferenceManager.deactivationService.add(
          deactivation as BindingDeactivation,
          {
            moduleId,
            serviceId: serviceIdentifier,
          },
        );
      },
      rebind: this.#bindingManager.rebind.bind(this.#bindingManager),
      rebindAsync: this.#bindingManager.rebindAsync.bind(this.#bindingManager),
      unbind: this.#bindingManager.unbind.bind(this.#bindingManager),
      unbindAsync: this.#bindingManager.unbindAsync.bind(this.#bindingManager),
    };
  }

  #clearAfterUnloadModules(modules: ContainerModule[]): void {
    for (const module of modules) {
      this.#serviceReferenceManager.activationService.removeAllByModuleId(
        module.id,
      );
      this.#serviceReferenceManager.bindingService.removeAllByModuleId(
        module.id,
      );
      this.#serviceReferenceManager.deactivationService.removeAllByModuleId(
        module.id,
      );
    }

    this.#serviceReferenceManager.planResultCacheService.clearCache();
  }

  #load(...modules: ContainerModule[]): (void | Promise<void>)[] {
    return modules.map((module: ContainerModule): void | Promise<void> =>
      module.load(this.#buildContainerModuleLoadOptions(module.id)),
    );
  }

  #setBinding(binding: Binding): void {
    this.#serviceReferenceManager.bindingService.set(binding);

    this.#planResultCacheManager.invalidateService({
      binding: binding as Binding<unknown>,
      kind: CacheBindingInvalidationKind.bindingAdded,
    });
  }

  #unload(...modules: ContainerModule[]): (void | Promise<void>)[] {
    return modules.map((module: ContainerModule): void | Promise<void> =>
      resolveModuleDeactivations(this.#deactivationParams, module.id),
    );
  }
}
