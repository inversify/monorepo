import { type Newable } from '@inversifyjs/common';
import {
  type ActivationsService,
  type BindingService,
  type DeactivationsService,
  type PlanResultCacheService,
} from '@inversifyjs/core';
import {
  isPlugin,
  type Plugin,
  type PluginApi,
  type PluginContext,
} from '@inversifyjs/plugin';

import { InversifyContainerError } from '../../error/models/InversifyContainerError.js';
import { InversifyContainerErrorKind } from '../../error/models/InversifyContainerErrorKind.js';
import type { Container } from './Container.js';
import { type ServiceReferenceManager } from './ServiceReferenceManager.js';
import { type ServiceResolutionManager } from './ServiceResolutionManager.js';

export class PluginManager {
  readonly #pluginApi: PluginApi;
  readonly #pluginContext: PluginContext;
  readonly #serviceResolutionManager: ServiceResolutionManager;
  readonly #serviceReferenceManager: ServiceReferenceManager;

  constructor(
    container: Container,
    serviceReferenceManager: ServiceReferenceManager,
    serviceResolutionManager: ServiceResolutionManager,
  ) {
    this.#serviceReferenceManager = serviceReferenceManager;
    this.#serviceResolutionManager = serviceResolutionManager;
    this.#pluginApi = this.#buildPluginApi(container);
    this.#pluginContext = this.#buildPluginContext();
  }

  public register(
    container: Container,
    pluginConstructor: Newable<unknown, [Container, PluginContext]>,
  ): void {
    const pluginInstance: Partial<Plugin<Container>> = new pluginConstructor(
      container,
      this.#pluginContext,
    ) as Partial<Plugin<Container>>;

    this.#assertIsPlugin(pluginInstance);

    pluginInstance.load(this.#pluginApi);
  }

  #assertIsPlugin(
    value: Partial<Plugin<Container>>,
  ): asserts value is Plugin<Container> {
    if (value[isPlugin] !== true) {
      throw new InversifyContainerError(
        InversifyContainerErrorKind.invalidOperation,
        'Invalid plugin. The plugin must extend the Plugin class',
      );
    }
  }

  #buildPluginApi(container: Container): PluginApi {
    return {
      define: (
        name: string | symbol,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        method: (...args: any[]) => unknown,
      ): void => {
        if (Object.prototype.hasOwnProperty.call(container, name)) {
          throw new InversifyContainerError(
            InversifyContainerErrorKind.invalidOperation,
            `Container already has a method named "${String(name)}"`,
          );
        }

        (container as unknown as Record<string | symbol, unknown>)[name] =
          method;
      },
      onPlan: this.#serviceResolutionManager.onPlan.bind(
        this.#serviceResolutionManager,
      ),
    };
  }

  #buildPluginContext(): PluginContext {
    const serviceReferenceManager: ServiceReferenceManager =
      this.#serviceReferenceManager;

    return {
      get activationService(): ActivationsService {
        return serviceReferenceManager.activationService;
      },
      get bindingService(): BindingService {
        return serviceReferenceManager.bindingService;
      },
      get deactivationService(): DeactivationsService {
        return serviceReferenceManager.deactivationService;
      },
      get planResultCacheService(): PlanResultCacheService {
        return serviceReferenceManager.planResultCacheService;
      },
    };
  }
}
