import {
  isPromise,
  ServiceIdentifier,
  stringifyServiceIdentifier,
} from '@inversifyjs/common';
import {
  ActivationsService,
  Binding,
  BindingActivation,
  BindingConstraints,
  BindingDeactivation,
  BindingScope,
  bindingScopeValues,
  BindingService,
  DeactivationParams,
  DeactivationsService,
  getClassMetadata,
  GetOptions,
  GetPlanOptions,
  OptionalGetOptions,
  plan,
  PlanParams,
  PlanResult,
  PlanResultCacheService,
  ResolutionContext,
  resolve,
  resolveBindingsDeactivations,
  resolveModuleDeactivations,
  resolveServiceDeactivations,
} from '@inversifyjs/core';

import { isBindingIdentifier } from '../../binding/calculations/isBindingIdentifier';
import { BindToFluentSyntax } from '../../binding/models/BindingFluentSyntax';
import { BindToFluentSyntaxImplementation } from '../../binding/models/BindingFluentSyntaxImplementation';
import { BindingIdentifier } from '../../binding/models/BindingIdentifier';
import { getFirstIterableResult } from '../../common/calculations/getFirstIterableResult';
import { InversifyContainerError } from '../../error/models/InversifyContainerError';
import { InversifyContainerErrorKind } from '../../error/models/InversifyContainerErrorKind';
import { Snapshot } from '../../snapshot/models/Snapshot';
import {
  ContainerModule,
  ContainerModuleLoadOptions,
} from '../models/ContainerModule';
import { IsBoundOptions } from '../models/isBoundOptions';

export interface ContainerOptions {
  autobind?: true;
  defaultScope?: BindingScope | undefined;
  parent?: Container | undefined;
}

interface InternalContainerOptions {
  autobind: boolean;
  defaultScope: BindingScope;
}

const DEFAULT_DEFAULT_SCOPE: BindingScope = bindingScopeValues.Transient;

export class Container {
  #activationService: ActivationsService;
  #bindingService: BindingService;
  readonly #deactivationParams: DeactivationParams;
  #deactivationService: DeactivationsService;
  #getActivationsResolutionParam: <TActivated>(
    serviceIdentifier: ServiceIdentifier<TActivated>,
  ) => Iterable<BindingActivation<TActivated>> | undefined;
  #getBindingsPlanParams: <TInstance>(
    serviceIdentifier: ServiceIdentifier<TInstance>,
  ) => Iterable<Binding<TInstance>> | undefined;
  readonly #options: InternalContainerOptions;
  readonly #planResultCacheService: PlanResultCacheService;
  #resolutionContext: ResolutionContext;
  #setBindingParamsPlan: <TInstance>(binding: Binding<TInstance>) => void;
  readonly #snapshots: Snapshot[];

  constructor(options?: ContainerOptions) {
    this.#deactivationParams = this.#buildDeactivationParams();
    this.#getActivationsResolutionParam = <TActivated>(
      serviceIdentifier: ServiceIdentifier<TActivated>,
    ): Iterable<BindingActivation<TActivated>> | undefined =>
      this.#activationService.get(serviceIdentifier) as
        | Iterable<BindingActivation<TActivated>>
        | undefined;
    this.#planResultCacheService = new PlanResultCacheService();
    this.#resolutionContext = this.#buildResolutionContext();

    if (options?.parent === undefined) {
      this.#activationService = ActivationsService.build(undefined);
      this.#bindingService = BindingService.build(undefined);
      this.#deactivationService = DeactivationsService.build(undefined);
    } else {
      this.#activationService = ActivationsService.build(
        options.parent.#activationService,
      );
      this.#bindingService = BindingService.build(
        options.parent.#bindingService,
      );
      this.#deactivationService = DeactivationsService.build(
        options.parent.#deactivationService,
      );

      options.parent.#planResultCacheService.subscribe(
        this.#planResultCacheService,
      );
    }

    this.#getBindingsPlanParams = this.#bindingService.get.bind(
      this.#bindingService,
    );
    this.#setBindingParamsPlan = this.#setBinding.bind(this);

    this.#options = {
      autobind: options?.autobind ?? false,
      defaultScope: options?.defaultScope ?? DEFAULT_DEFAULT_SCOPE,
    };
    this.#snapshots = [];
  }

  public bind<T>(
    serviceIdentifier: ServiceIdentifier<T>,
  ): BindToFluentSyntax<T> {
    return new BindToFluentSyntaxImplementation(
      (binding: Binding): void => {
        this.#setBinding(binding);
      },
      undefined,
      this.#options.defaultScope,
      serviceIdentifier,
    );
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
    const planResult: PlanResult = this.#buildPlanResult(
      false,
      serviceIdentifier,
      options,
    );

    const resolvedValue: T | Promise<T> | undefined =
      this.#getFromPlanResult(planResult);

    if (isPromise(resolvedValue)) {
      throw new InversifyContainerError(
        InversifyContainerErrorKind.invalidOperation,
        `Unexpected asyncronous service when resolving service "${stringifyServiceIdentifier(serviceIdentifier)}"`,
      );
    }

    return resolvedValue;
  }

  public getAll<T>(
    serviceIdentifier: ServiceIdentifier<T>,
    options?: GetOptions,
  ): T[] {
    const planResult: PlanResult = this.#buildPlanResult(
      true,
      serviceIdentifier,
      options,
    );

    const resolvedValue: T[] | Promise<T[]> =
      this.#getFromPlanResult(planResult);

    if (isPromise(resolvedValue)) {
      throw new InversifyContainerError(
        InversifyContainerErrorKind.invalidOperation,
        `Unexpected asyncronous service when resolving service "${stringifyServiceIdentifier(serviceIdentifier)}"`,
      );
    }

    return resolvedValue;
  }

  public async getAllAsync<T>(
    serviceIdentifier: ServiceIdentifier<T>,
    options?: GetOptions,
  ): Promise<T[]> {
    const planResult: PlanResult = this.#buildPlanResult(
      true,
      serviceIdentifier,
      options,
    );

    return this.#getFromPlanResult(planResult);
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
    const planResult: PlanResult = this.#buildPlanResult(
      false,
      serviceIdentifier,
      options,
    );

    return this.#getFromPlanResult(planResult);
  }

  public isBound(
    serviceIdentifier: ServiceIdentifier,
    options?: IsBoundOptions,
  ): boolean {
    const bindings: Iterable<Binding<unknown>> | undefined =
      this.#bindingService.get(serviceIdentifier);

    return this.#isAnyValidBinding(serviceIdentifier, bindings, options);
  }

  public isCurrentBound(
    serviceIdentifier: ServiceIdentifier,
    options?: IsBoundOptions,
  ): boolean {
    const bindings: Iterable<Binding<unknown>> | undefined =
      this.#bindingService.getNonParentBindings(serviceIdentifier);

    return this.#isAnyValidBinding(serviceIdentifier, bindings, options);
  }

  public async load(...modules: ContainerModule[]): Promise<void> {
    await Promise.all(
      modules.map(
        async (module: ContainerModule): Promise<void> =>
          module.load(this.#buildContainerModuleLoadOptions(module.id)),
      ),
    );
  }

  public onActivation<T>(
    serviceIdentifier: ServiceIdentifier<T>,
    activation: BindingActivation<T>,
  ): void {
    this.#activationService.add(activation as BindingActivation, {
      serviceId: serviceIdentifier,
    });
  }

  public onDeactivation<T>(
    serviceIdentifier: ServiceIdentifier<T>,
    deactivation: BindingDeactivation<T>,
  ): void {
    this.#deactivationService.add(deactivation as BindingDeactivation, {
      serviceId: serviceIdentifier,
    });
  }

  public restore(): void {
    const snapshot: Snapshot | undefined = this.#snapshots.pop();

    if (snapshot === undefined) {
      throw new InversifyContainerError(
        InversifyContainerErrorKind.invalidOperation,
        'No snapshot available to restore',
      );
    }

    this.#activationService = snapshot.activationService;
    this.#bindingService = snapshot.bindingService;
    this.#deactivationService = snapshot.deactivationService;

    this.#resetComputedProperties();
  }

  public snapshot(): void {
    this.#snapshots.push({
      activationService: this.#activationService.clone(),
      bindingService: this.#bindingService.clone(),
      deactivationService: this.#deactivationService.clone(),
    });
  }

  public async unbind(
    identifier: BindingIdentifier | ServiceIdentifier,
  ): Promise<void> {
    await this.#unbind(identifier);
  }

  public async unbindAll(): Promise<void> {
    const nonParentBoundServiceIds: ServiceIdentifier[] = [
      ...this.#bindingService.getNonParentBoundServices(),
    ];

    await Promise.all(
      nonParentBoundServiceIds.map(
        async (serviceId: ServiceIdentifier): Promise<void> =>
          resolveServiceDeactivations(this.#deactivationParams, serviceId),
      ),
    );

    /*
     * Removing service related objects here so unbindAll is deterministic.
     *
     * Removing service related objects as soon as resolveModuleDeactivations takes
     * effect leads to module deactivations not triggering previously deleted
     * deactivations, introducing non determinism depending in the order in which
     * services are deactivated.
     */
    for (const serviceId of nonParentBoundServiceIds) {
      this.#activationService.removeAllByServiceId(serviceId);
      this.#bindingService.removeAllByServiceId(serviceId);
      this.#deactivationService.removeAllByServiceId(serviceId);
    }

    this.#planResultCacheService.clearCache();
  }

  public unbindSync(identifier: BindingIdentifier | ServiceIdentifier): void {
    const result: void | Promise<void> = this.#unbind(identifier);

    if (result !== undefined) {
      this.#throwUnexpectedAsyncUnbindOperation(identifier);
    }
  }

  public async unload(...modules: ContainerModule[]): Promise<void> {
    await Promise.all(
      modules.map((module: ContainerModule): void | Promise<void> =>
        resolveModuleDeactivations(this.#deactivationParams, module.id),
      ),
    );

    /*
     * Removing module related objects here so unload is deterministic.
     *
     * Removing modules as soon as resolveModuleDeactivations takes effect leads to
     * module deactivations not triggering previously deleted deactivations,
     * introducing non determinism depending in the order in which modules are
     * deactivated.
     */
    for (const module of modules) {
      this.#activationService.removeAllByModuleId(module.id);
      this.#bindingService.removeAllByModuleId(module.id);
      this.#deactivationService.removeAllByModuleId(module.id);
    }

    this.#planResultCacheService.clearCache();
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
          this.#options.defaultScope,
          serviceIdentifier,
        );
      },
      isBound: this.isBound.bind(this),
      onActivation: <T>(
        serviceIdentifier: ServiceIdentifier<T>,
        activation: BindingActivation<T>,
      ): void => {
        this.#activationService.add(activation as BindingActivation, {
          moduleId,
          serviceId: serviceIdentifier,
        });
      },
      onDeactivation: <T>(
        serviceIdentifier: ServiceIdentifier<T>,
        deactivation: BindingDeactivation<T>,
      ): void => {
        this.#deactivationService.add(deactivation as BindingDeactivation, {
          moduleId,
          serviceId: serviceIdentifier,
        });
      },
      unbind: this.unbind.bind(this),
    };
  }

  #buildDeactivationParams(): DeactivationParams {
    return {
      getBindings: <TInstance>(
        serviceIdentifier: ServiceIdentifier<TInstance>,
      ): Iterable<Binding<TInstance>> | undefined =>
        this.#bindingService.get(serviceIdentifier),
      getBindingsFromModule: <TInstance>(
        moduleId: number,
      ): Iterable<Binding<TInstance>> | undefined =>
        this.#bindingService.getByModuleId(moduleId),
      getClassMetadata,
      getDeactivations: <TActivated>(
        serviceIdentifier: ServiceIdentifier<TActivated>,
      ) => this.#deactivationService.get(serviceIdentifier),
    };
  }

  #buildGetPlanOptions(
    isMultiple: boolean,
    serviceIdentifier: ServiceIdentifier,
    options: GetOptions | undefined,
  ): GetPlanOptions {
    return {
      isMultiple,
      name: options?.name,
      optional: options?.optional,
      serviceIdentifier,
      tag: options?.tag,
    };
  }

  #buildPlanParams(
    serviceIdentifier: ServiceIdentifier,
    isMultiple: boolean,
    options?: GetOptions,
  ): PlanParams {
    const planParams: PlanParams = {
      autobindOptions:
        (options?.autobind ?? this.#options.autobind)
          ? {
              scope: this.#options.defaultScope,
            }
          : undefined,
      getBindings: this.#getBindingsPlanParams,
      getClassMetadata,
      rootConstraints: {
        isMultiple,
        serviceIdentifier,
      },
      servicesBranch: [],
      setBinding: this.#setBindingParamsPlan,
    };

    this.#handlePlanParamsRootConstraints(planParams, options);

    return planParams;
  }

  #buildPlanResult(
    isMultiple: boolean,
    serviceIdentifier: ServiceIdentifier,
    options: GetOptions | undefined,
  ): PlanResult {
    const getPlanOptions: GetPlanOptions = this.#buildGetPlanOptions(
      isMultiple,
      serviceIdentifier,
      options,
    );

    const planResultFromCache: PlanResult | undefined =
      this.#planResultCacheService.get(getPlanOptions);

    if (planResultFromCache !== undefined) {
      return planResultFromCache;
    }

    const planResult: PlanResult = plan(
      this.#buildPlanParams(serviceIdentifier, isMultiple, options),
    );

    this.#planResultCacheService.set(getPlanOptions, planResult);

    return planResult;
  }

  #buildResolutionContext(): ResolutionContext {
    return {
      get: this.get.bind(this),
      getAll: this.getAll.bind(this),
      getAllAsync: this.getAllAsync.bind(this),
      getAsync: this.getAsync.bind(this),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  #getFromPlanResult<T>(planResult: PlanResult): T {
    return resolve({
      context: this.#resolutionContext,
      getActivations: this.#getActivationsResolutionParam,
      planResult,
      requestScopeCache: new Map(),
    }) as T;
  }

  #handlePlanParamsRootConstraints(
    planParams: PlanParams,
    options: GetOptions | undefined,
  ): void {
    if (options === undefined) {
      return;
    }

    if (options.name !== undefined) {
      planParams.rootConstraints.name = options.name;
    }

    if (options.optional === true) {
      planParams.rootConstraints.isOptional = true;
    }

    if (options.tag !== undefined) {
      planParams.rootConstraints.tag = {
        key: options.tag.key,
        value: options.tag.value,
      };
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

  #resetComputedProperties(): void {
    this.#planResultCacheService.clearCache();

    this.#getActivationsResolutionParam = <TActivated>(
      serviceIdentifier: ServiceIdentifier<TActivated>,
    ): Iterable<BindingActivation<TActivated>> | undefined =>
      this.#activationService.get(serviceIdentifier) as
        | Iterable<BindingActivation<TActivated>>
        | undefined;
    this.#getBindingsPlanParams = this.#bindingService.get.bind(
      this.#bindingService,
    );
    this.#resolutionContext = this.#buildResolutionContext();
    this.#setBindingParamsPlan = this.#setBinding.bind(this);
  }

  #setBinding(binding: Binding): void {
    this.#bindingService.set(binding);

    this.#planResultCacheService.clearCache();
  }

  #throwUnexpectedAsyncUnbindOperation(
    identifier: BindingIdentifier | ServiceIdentifier,
  ): never {
    let errorMessage: string;

    if (isBindingIdentifier(identifier)) {
      const bindingsById: Iterable<Binding<unknown>> | undefined =
        this.#bindingService.getById(identifier.id);

      const bindingServiceIdentifier: ServiceIdentifier | undefined =
        getFirstIterableResult(bindingsById)?.serviceIdentifier;

      if (bindingServiceIdentifier === undefined) {
        errorMessage =
          'Unexpected asyncronous deactivation when unbinding binding identifier. Consider using Container.unbind() instead.';
      } else {
        errorMessage = `Unexpected asyncronous deactivation when unbinding "${stringifyServiceIdentifier(bindingServiceIdentifier)}" binding. Consider using Container.unbind() instead.`;
      }
    } else {
      errorMessage = `Unexpected asyncronous deactivation when unbinding "${stringifyServiceIdentifier(identifier)}" service. Consider using Container.unbind() instead.`;
    }

    throw new InversifyContainerError(
      InversifyContainerErrorKind.invalidOperation,
      errorMessage,
    );
  }

  #unbind(
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
    const bindings: Iterable<Binding<unknown>> | undefined =
      this.#bindingService.getById(identifier.id);

    const result: void | Promise<void> = resolveBindingsDeactivations(
      this.#deactivationParams,
      bindings,
    );

    if (result === undefined) {
      this.#clearAfterUnbindBindingIdentifier(identifier);
    } else {
      return result.then((): void => {
        this.#clearAfterUnbindBindingIdentifier(identifier);
      });
    }
  }

  #clearAfterUnbindBindingIdentifier(identifier: BindingIdentifier): void {
    this.#bindingService.removeById(identifier.id);
    this.#planResultCacheService.clearCache();
  }

  #unbindServiceIdentifier(
    identifier: ServiceIdentifier,
  ): void | Promise<void> {
    const result: void | Promise<void> = resolveServiceDeactivations(
      this.#deactivationParams,
      identifier,
    );

    if (result === undefined) {
      this.#clearAfterUnbindServiceIdentifier(identifier);
    } else {
      return result.then((): void => {
        this.#clearAfterUnbindServiceIdentifier(identifier);
      });
    }
  }

  #clearAfterUnbindServiceIdentifier(identifier: ServiceIdentifier): void {
    this.#activationService.removeAllByServiceId(identifier);
    this.#bindingService.removeAllByServiceId(identifier);
    this.#deactivationService.removeAllByServiceId(identifier);

    this.#planResultCacheService.clearCache();
  }
}
