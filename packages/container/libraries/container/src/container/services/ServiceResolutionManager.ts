import {
  isPromise,
  ServiceIdentifier,
  stringifyServiceIdentifier,
} from '@inversifyjs/common';
import {
  BindingActivation,
  BindingScope,
  GetAllOptions,
  GetOptions,
  GetOptionsTagConstraint,
  GetPlanOptions,
  MetadataName,
  OptionalGetOptions,
  plan,
  PlanParams,
  PlanParamsConstraint,
  PlanResult,
  ResolutionContext,
  resolve,
} from '@inversifyjs/core';

import { InversifyContainerError } from '../../error/models/InversifyContainerError';
import { InversifyContainerErrorKind } from '../../error/models/InversifyContainerErrorKind';
import { PlanParamsOperationsManager } from './PlanParamsOperationsManager';
import { ServiceReferenceManager } from './ServiceReferenceManager';

export class ServiceResolutionManager {
  readonly #autobind: boolean;
  readonly #defaultScope: BindingScope;
  readonly #getActivationsResolutionParam: <TActivated>(
    serviceIdentifier: ServiceIdentifier<TActivated>,
  ) => Iterable<BindingActivation<TActivated>> | undefined;
  #resolutionContext: ResolutionContext;
  readonly #onPlanHandlers: ((
    options: GetPlanOptions,
    result: PlanResult,
  ) => void)[];
  readonly #planParamsOperationsManager: PlanParamsOperationsManager;
  readonly #serviceReferenceManager: ServiceReferenceManager;

  constructor(
    planParamsOperationsManager: PlanParamsOperationsManager,
    serviceReferenceManager: ServiceReferenceManager,
    autobind: boolean,
    defaultScope: BindingScope,
  ) {
    this.#planParamsOperationsManager = planParamsOperationsManager;
    this.#serviceReferenceManager = serviceReferenceManager;
    this.#resolutionContext = this.#buildResolutionContext();
    this.#autobind = autobind;
    this.#defaultScope = defaultScope;

    this.#getActivationsResolutionParam = <TActivated>(
      serviceIdentifier: ServiceIdentifier<TActivated>,
    ): Iterable<BindingActivation<TActivated>> | undefined =>
      this.#serviceReferenceManager.activationService.get(serviceIdentifier) as
        | Iterable<BindingActivation<TActivated>>
        | undefined;

    this.#onPlanHandlers = [];

    this.#serviceReferenceManager.onReset(() => {
      this.#resetComputedProperties();
    });
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
        `Unexpected asynchronous service when resolving service "${stringifyServiceIdentifier(serviceIdentifier)}"`,
      );
    }

    return resolvedValue;
  }

  public getAll<T>(
    serviceIdentifier: ServiceIdentifier<T>,
    options?: GetAllOptions,
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
        `Unexpected asynchronous service when resolving service "${stringifyServiceIdentifier(serviceIdentifier)}"`,
      );
    }

    return resolvedValue;
  }

  public async getAllAsync<T>(
    serviceIdentifier: ServiceIdentifier<T>,
    options?: GetAllOptions,
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

  public onPlan(
    handler: (options: GetPlanOptions, result: PlanResult) => void,
  ): void {
    this.#onPlanHandlers.push(handler);
  }

  #resetComputedProperties(): void {
    this.#resolutionContext = this.#buildResolutionContext();
  }

  #buildGetPlanOptions(
    isMultiple: boolean,
    serviceIdentifier: ServiceIdentifier,
    options: GetOptions | GetAllOptions | undefined,
  ): GetPlanOptions {
    const name: MetadataName | undefined = options?.name;
    const optional: boolean = options?.optional ?? false;
    const tag: GetOptionsTagConstraint | undefined = options?.tag;

    if (isMultiple) {
      return {
        chained:
          (options as Partial<GetAllOptions> | undefined)?.chained ?? false,
        isMultiple,
        name,
        optional,
        serviceIdentifier,
        tag,
      };
    } else {
      return {
        isMultiple,
        name,
        optional,
        serviceIdentifier,
        tag,
      };
    }
  }

  #buildPlanParams(
    serviceIdentifier: ServiceIdentifier,
    isMultiple: boolean,
    options?: GetOptions | GetAllOptions,
  ): PlanParams {
    const planParams: PlanParams = {
      autobindOptions:
        (options?.autobind ?? this.#autobind)
          ? {
              scope: this.#defaultScope,
            }
          : undefined,
      operations: this.#planParamsOperationsManager.planParamsOperations,
      rootConstraints: this.#buildPlanParamsConstraints(
        serviceIdentifier,
        isMultiple,
        options,
      ),
      servicesBranch: [],
    };

    this.#handlePlanParamsRootConstraints(planParams, options);

    return planParams;
  }

  #buildPlanParamsConstraints(
    serviceIdentifier: ServiceIdentifier,
    isMultiple: boolean,
    options?: GetOptions | GetAllOptions,
  ): PlanParamsConstraint {
    if (isMultiple) {
      return {
        chained:
          (options as Partial<GetAllOptions> | undefined)?.chained ?? false,
        isMultiple,
        serviceIdentifier,
      };
    } else {
      return {
        isMultiple,
        serviceIdentifier,
      };
    }
  }

  #buildPlanResult(
    isMultiple: boolean,
    serviceIdentifier: ServiceIdentifier,
    options: GetOptions | GetAllOptions | undefined,
  ): PlanResult {
    const getPlanOptions: GetPlanOptions = this.#buildGetPlanOptions(
      isMultiple,
      serviceIdentifier,
      options,
    );

    const planResultFromCache: PlanResult | undefined =
      this.#serviceReferenceManager.planResultCacheService.get(getPlanOptions);

    if (planResultFromCache !== undefined) {
      return planResultFromCache;
    }

    const planResult: PlanResult = plan(
      this.#buildPlanParams(serviceIdentifier, isMultiple, options),
    );

    for (const handler of this.#onPlanHandlers) {
      handler(getPlanOptions, planResult);
    }

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
    options: GetOptions | GetAllOptions | undefined,
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

    if (planParams.rootConstraints.isMultiple) {
      planParams.rootConstraints.chained =
        (options as Partial<GetAllOptions> | undefined)?.chained ?? false;
    }
  }
}
