import { Newable, ServiceIdentifier } from '@inversifyjs/common';
import {
  ActivationsService,
  AutobindOptions,
  BindingActivation,
  BindingDeactivation,
  BindingScope,
  bindingScopeValues,
  BindingService,
  DeactivationsService,
  GetAllOptions,
  GetOptions,
  OptionalGetOptions,
  PlanResultCacheService,
} from '@inversifyjs/core';

import { BindToFluentSyntax } from '../../binding/models/BindingFluentSyntax';
import { BindingIdentifier } from '../../binding/models/BindingIdentifier';
import { ContainerModule } from '../models/ContainerModule';
import { ContainerOptions } from '../models/ContainerOptions';
import { IsBoundOptions } from '../models/isBoundOptions';
import { BindingManager } from './BindingManager';
import { ContainerModuleManager } from './ContainerModuleManager';
import { DeactivationParamsManager } from './DeactivationParamsManager';
import { PlanParamsOperationsManager } from './PlanParamsOperationsManager';
import { PlanResultCacheManager } from './PlanResultCacheManager';
import { PluginManager } from './PluginManager';
import { ServiceReferenceManager } from './ServiceReferenceManager';
import { ServiceResolutionManager } from './ServiceResolutionManager';
import { SnapshotManager } from './SnapshotManager';

const DEFAULT_DEFAULT_SCOPE: BindingScope = bindingScopeValues.Transient;

export class Container {
  readonly #bindingManager: BindingManager;
  readonly #containerModuleManager: ContainerModuleManager;
  readonly #pluginManager: PluginManager;
  readonly #serviceReferenceManager: ServiceReferenceManager;
  readonly #serviceResolutionManager: ServiceResolutionManager;
  readonly #snapshotManager: SnapshotManager;

  constructor(options?: ContainerOptions) {
    const autobind: boolean = options?.autobind ?? false;
    const defaultScope: BindingScope =
      options?.defaultScope ?? DEFAULT_DEFAULT_SCOPE;

    this.#serviceReferenceManager = this.#buildServiceReferenceManager(
      options,
      autobind,
      defaultScope,
    );

    const planParamsOperationsManager: PlanParamsOperationsManager =
      new PlanParamsOperationsManager(this.#serviceReferenceManager);

    const planResultCacheManager: PlanResultCacheManager =
      new PlanResultCacheManager(
        planParamsOperationsManager,
        this.#serviceReferenceManager,
      );

    const deactivationParamsManager: DeactivationParamsManager =
      new DeactivationParamsManager(this.#serviceReferenceManager);

    this.#bindingManager = new BindingManager(
      deactivationParamsManager.deactivationParams,
      defaultScope,
      planResultCacheManager,
      this.#serviceReferenceManager,
    );
    this.#containerModuleManager = new ContainerModuleManager(
      this.#bindingManager,
      deactivationParamsManager.deactivationParams,
      defaultScope,
      planResultCacheManager,
      this.#serviceReferenceManager,
    );
    this.#serviceResolutionManager = new ServiceResolutionManager(
      planParamsOperationsManager,
      this.#serviceReferenceManager,
      autobind,
      defaultScope,
    );
    this.#pluginManager = new PluginManager(
      this,
      this.#serviceReferenceManager,
      this.#serviceResolutionManager,
    );

    this.#snapshotManager = new SnapshotManager(this.#serviceReferenceManager);
  }

  public bind<T>(
    serviceIdentifier: ServiceIdentifier<T>,
  ): BindToFluentSyntax<T> {
    return this.#bindingManager.bind(serviceIdentifier);
  }

  public get<T>(
    serviceIdentifier: ServiceIdentifier<T>,
    options: OptionalGetOptions,
  ): T | undefined;
  public get<T>(
    serviceIdentifier: ServiceIdentifier<T>,
    options?: GetOptions,
  ): T;
  public get<T>(
    serviceIdentifier: ServiceIdentifier<T>,
    options?: GetOptions,
  ): T | undefined {
    return this.#serviceResolutionManager.get(serviceIdentifier, options);
  }

  public getAll<T>(
    serviceIdentifier: ServiceIdentifier<T>,
    options?: GetAllOptions,
  ): T[] {
    return this.#serviceResolutionManager.getAll(serviceIdentifier, options);
  }

  public async getAllAsync<T>(
    serviceIdentifier: ServiceIdentifier<T>,
    options?: GetAllOptions,
  ): Promise<T[]> {
    return this.#serviceResolutionManager.getAllAsync(
      serviceIdentifier,
      options,
    );
  }

  public async getAsync<T>(
    serviceIdentifier: ServiceIdentifier<T>,
    options: OptionalGetOptions,
  ): Promise<T | undefined>;
  public async getAsync<T>(
    serviceIdentifier: ServiceIdentifier<T>,
    options?: GetOptions,
  ): Promise<T>;
  public async getAsync<T>(
    serviceIdentifier: ServiceIdentifier<T>,
    options?: GetOptions,
  ): Promise<T | undefined> {
    return this.#serviceResolutionManager.getAsync(serviceIdentifier, options);
  }

  public isBound(
    serviceIdentifier: ServiceIdentifier,
    options?: IsBoundOptions,
  ): boolean {
    return this.#bindingManager.isBound(serviceIdentifier, options);
  }

  public isCurrentBound(
    serviceIdentifier: ServiceIdentifier,
    options?: IsBoundOptions,
  ): boolean {
    return this.#bindingManager.isCurrentBound(serviceIdentifier, options);
  }

  public async load(...modules: ContainerModule[]): Promise<void> {
    return this.#containerModuleManager.load(...modules);
  }

  public loadSync(...modules: ContainerModule[]): void {
    this.#containerModuleManager.loadSync(...modules);
  }

  public onActivation<T>(
    serviceIdentifier: ServiceIdentifier<T>,
    activation: BindingActivation<T>,
  ): void {
    this.#serviceReferenceManager.activationService.add(
      activation as BindingActivation,
      {
        serviceId: serviceIdentifier,
      },
    );
  }

  public onDeactivation<T>(
    serviceIdentifier: ServiceIdentifier<T>,
    deactivation: BindingDeactivation<T>,
  ): void {
    this.#serviceReferenceManager.deactivationService.add(
      deactivation as BindingDeactivation,
      {
        serviceId: serviceIdentifier,
      },
    );
  }

  public register(pluginConstructor: Newable): void {
    this.#pluginManager.register(this, pluginConstructor);
  }

  public restore(): void {
    this.#snapshotManager.restore();
  }

  public async rebind<T>(
    serviceIdentifier: ServiceIdentifier<T>,
  ): Promise<BindToFluentSyntax<T>> {
    return this.#bindingManager.rebind(serviceIdentifier);
  }

  public rebindSync<T>(
    serviceIdentifier: ServiceIdentifier<T>,
  ): BindToFluentSyntax<T> {
    return this.#bindingManager.rebindSync(serviceIdentifier);
  }

  public snapshot(): void {
    this.#snapshotManager.snapshot();
  }

  public async unbind(
    identifier: BindingIdentifier | ServiceIdentifier,
  ): Promise<void> {
    await this.#bindingManager.unbind(identifier);
  }

  public async unbindAll(): Promise<void> {
    return this.#bindingManager.unbindAll();
  }

  public unbindSync(identifier: BindingIdentifier | ServiceIdentifier): void {
    this.#bindingManager.unbindSync(identifier);
  }

  public async unload(...modules: ContainerModule[]): Promise<void> {
    return this.#containerModuleManager.unload(...modules);
  }

  public unloadSync(...modules: ContainerModule[]): void {
    this.#containerModuleManager.unloadSync(...modules);
  }

  #buildAutobindOptions(
    autobind: boolean,
    defaultScope: BindingScope,
  ): AutobindOptions | undefined {
    if (autobind) {
      return { scope: defaultScope };
    }

    return undefined;
  }

  #buildServiceReferenceManager(
    options: ContainerOptions | undefined,
    autobind: boolean,
    defaultScope: BindingScope,
  ): ServiceReferenceManager {
    const autobindOptions: AutobindOptions | undefined =
      this.#buildAutobindOptions(autobind, defaultScope);

    if (options?.parent === undefined) {
      return new ServiceReferenceManager(
        ActivationsService.build(() => undefined),
        BindingService.build(() => undefined, autobindOptions),
        DeactivationsService.build(() => undefined),
        new PlanResultCacheService(),
      );
    }

    const planResultCacheService: PlanResultCacheService =
      new PlanResultCacheService();

    const parent: Container = options.parent;

    parent.#serviceReferenceManager.planResultCacheService.subscribe(
      planResultCacheService,
    );

    return new ServiceReferenceManager(
      ActivationsService.build(
        () => parent.#serviceReferenceManager.activationService,
      ),
      BindingService.build(
        () => parent.#serviceReferenceManager.bindingService,
        autobindOptions,
      ),
      DeactivationsService.build(
        () => parent.#serviceReferenceManager.deactivationService,
      ),
      planResultCacheService,
    );
  }
}
