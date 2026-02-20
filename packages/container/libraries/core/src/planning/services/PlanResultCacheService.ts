import { type ServiceIdentifier } from '@inversifyjs/common';

import { bindingTypeValues } from '../../binding/models/BindingType.js';
import { WeakList } from '../../common/models/WeakList.js';
import { type MetadataName } from '../../metadata/models/MetadataName.js';
import { type MetadataTag } from '../../metadata/models/MetadataTag.js';
import { type PlanServiceNodeBindingAddedResult } from '../../metadata/models/PlanServiceNodeBindingAddedResult.js';
import { type PlanServiceNodeBindingRemovedResult } from '../../metadata/models/PlanServiceNodeBindingRemovedResult.js';
import { addRootServiceNodeBindingIfContextFree } from '../actions/addRootServiceNodeBindingIfContextFree.js';
import { addServiceNodeBindingIfContextFree } from '../actions/addServiceNodeBindingIfContextFree.js';
import { removeRootServiceNodeBindingIfContextFree } from '../actions/removeRootServiceNodeBindingIfContextFree.js';
import { removeServiceNodeBindingIfContextFree } from '../actions/removeServiceNodeBindingIfContextFree.js';
import { type CacheBindingInvalidation } from '../models/CacheBindingInvalidation.js';
import { CacheBindingInvalidationKind } from '../models/CacheBindingInvalidationKind.js';
import { type GetPlanOptions } from '../models/GetPlanOptions.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { LazyPlanServiceNode } from '../models/LazyPlanServiceNode.js';
import { type NonCachedServiceNodeContext } from '../models/NonCachedServiceNodeContext.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';
import { type PlanParams } from '../models/PlanParams.js';
import { type PlanParamsConstraint } from '../models/PlanParamsConstraint.js';
import { type PlanParamsTagConstraint } from '../models/PlanParamsTagConstraint.js';
import { type PlanResult } from '../models/PlanResult.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { type PlanServiceRedirectionBindingNode } from '../models/PlanServiceRedirectionBindingNode.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';

const CHAINED_MASK: number = 0x4;
const IS_MULTIPLE_MASK: number = 0x2;
const OPTIONAL_MASK: number = 0x1;

const MAP_ARRAY_LENGTH: number = 0x8;

/**
 * Service to cache plans.
 *
 * This class is used to cache plans and to notify PlanService subscribers when the cache is cleared.
 * The cache should be cleared when a new binding is registered or when a binding is unregistered.
 *
 * Subscribers are supposed to be plan services from child containers.
 *
 * Ancestor binding constraints are the reason to avoid reusing plans from plan children nodes.
 */
export class PlanResultCacheService {
  readonly #serviceIdToNonCachedServiceNodeMapMap: Map<
    ServiceIdentifier,
    Map<PlanServiceNode, NonCachedServiceNodeContext>
  >;

  readonly #serviceIdToValuePlanMap: Map<ServiceIdentifier, PlanResult>[];

  readonly #namedServiceIdToValuePlanMap: Map<
    ServiceIdentifier,
    Map<MetadataName, PlanResult>
  >[];
  readonly #namedTaggedServiceIdToValuePlanMap: Map<
    ServiceIdentifier,
    Map<MetadataName, Map<MetadataTag, Map<unknown, PlanResult>>>
  >[];
  readonly #taggedServiceIdToValuePlanMap: Map<
    ServiceIdentifier,
    Map<MetadataTag, Map<unknown, PlanResult>>
  >[];

  readonly #subscribers: WeakList<PlanResultCacheService>;

  constructor() {
    this.#serviceIdToNonCachedServiceNodeMapMap = new Map();
    this.#serviceIdToValuePlanMap = this.#buildInitializedMapArray();
    this.#namedServiceIdToValuePlanMap = this.#buildInitializedMapArray();
    this.#namedTaggedServiceIdToValuePlanMap = this.#buildInitializedMapArray();
    this.#taggedServiceIdToValuePlanMap = this.#buildInitializedMapArray();

    this.#subscribers = new WeakList<PlanResultCacheService>();
  }

  public clearCache(): void {
    for (const map of this.#getMaps()) {
      map.clear();
    }

    for (const subscriber of this.#subscribers) {
      subscriber.clearCache();
    }
  }

  public get(options: GetPlanOptions): PlanResult | undefined {
    if (options.name === undefined) {
      if (options.tag === undefined) {
        return this.#getMapFromMapArray(
          this.#serviceIdToValuePlanMap,
          options,
        ).get(options.serviceIdentifier);
      } else {
        return this.#getMapFromMapArray(
          this.#taggedServiceIdToValuePlanMap,
          options,
        )
          .get(options.serviceIdentifier)
          ?.get(options.tag.key)
          ?.get(options.tag.value);
      }
    } else {
      if (options.tag === undefined) {
        return this.#getMapFromMapArray(
          this.#namedServiceIdToValuePlanMap,
          options,
        )
          .get(options.serviceIdentifier)
          ?.get(options.name);
      } else {
        return this.#getMapFromMapArray(
          this.#namedTaggedServiceIdToValuePlanMap,
          options,
        )
          .get(options.serviceIdentifier)
          ?.get(options.name)
          ?.get(options.tag.key)
          ?.get(options.tag.value);
      }
    }
  }

  public invalidateServiceBinding(
    invalidation: CacheBindingInvalidation,
  ): void {
    this.#invalidateServiceMap(invalidation);
    this.#invalidateNamedServiceMap(invalidation);
    this.#invalidateNamedTaggedServiceMap(invalidation);
    this.#invalidateTaggedServiceMap(invalidation);
    this.#invalidateNonCachedServiceNodeSetMap(invalidation);

    for (const subscriber of this.#subscribers) {
      subscriber.invalidateServiceBinding(invalidation);
    }
  }

  public set(options: GetPlanOptions, planResult: PlanResult): void {
    if (options.name === undefined) {
      if (options.tag === undefined) {
        this.#getMapFromMapArray(this.#serviceIdToValuePlanMap, options).set(
          options.serviceIdentifier,
          planResult,
        );
      } else {
        this.#getOrBuildMapValueFromMapMap(
          this.#getOrBuildMapValueFromMapMap(
            this.#getMapFromMapArray(
              this.#taggedServiceIdToValuePlanMap,
              options,
            ),
            options.serviceIdentifier,
          ),
          options.tag.key,
        ).set(options.tag.value, planResult);
      }
    } else {
      if (options.tag === undefined) {
        this.#getOrBuildMapValueFromMapMap(
          this.#getMapFromMapArray(this.#namedServiceIdToValuePlanMap, options),
          options.serviceIdentifier,
        ).set(options.name, planResult);
      } else {
        this.#getOrBuildMapValueFromMapMap(
          this.#getOrBuildMapValueFromMapMap(
            this.#getOrBuildMapValueFromMapMap(
              this.#getMapFromMapArray(
                this.#namedTaggedServiceIdToValuePlanMap,
                options,
              ),
              options.serviceIdentifier,
            ),
            options.name,
          ),
          options.tag.key,
        ).set(options.tag.value, planResult);
      }
    }
  }

  public setNonCachedServiceNode(
    node: PlanServiceNode,
    context: NonCachedServiceNodeContext,
  ): void {
    let nonCachedMap:
      | Map<PlanServiceNode, NonCachedServiceNodeContext>
      | undefined = this.#serviceIdToNonCachedServiceNodeMapMap.get(
      node.serviceIdentifier,
    );

    if (nonCachedMap === undefined) {
      nonCachedMap = new Map();

      this.#serviceIdToNonCachedServiceNodeMapMap.set(
        node.serviceIdentifier,
        nonCachedMap,
      );
    }

    nonCachedMap.set(node, context);
  }

  public subscribe(subscriber: PlanResultCacheService): void {
    this.#subscribers.push(subscriber);
  }

  #buildInitializedMapArray<TKey, TValue>(): Map<TKey, TValue>[] {
    const mapArray: Map<TKey, TValue>[] = new Array<Map<TKey, TValue>>(
      MAP_ARRAY_LENGTH,
    );

    for (let i: number = 0; i < mapArray.length; ++i) {
      mapArray[i] = new Map<TKey, TValue>();
    }

    return mapArray;
  }

  #buildUpdatePlanParams(
    invalidation: CacheBindingInvalidation,
    index: number,
    name: MetadataName | undefined,
    tag: PlanParamsTagConstraint | undefined,
  ): PlanParams {
    const isMultiple: boolean = (index & IS_MULTIPLE_MASK) !== 0;

    let planParamsConstraint: PlanParamsConstraint;

    if (isMultiple) {
      const isChained: boolean =
        (index & IS_MULTIPLE_MASK & CHAINED_MASK) !== 0;

      planParamsConstraint = {
        chained: isChained,
        isMultiple,
        serviceIdentifier: invalidation.binding.serviceIdentifier,
      };
    } else {
      planParamsConstraint = {
        isMultiple,
        serviceIdentifier: invalidation.binding.serviceIdentifier,
      };
    }

    const isOptional: boolean = (index & OPTIONAL_MASK) !== 0;

    if (isOptional) {
      planParamsConstraint.isOptional = true;
    }

    if (name !== undefined) {
      planParamsConstraint.name = name;
    }

    if (tag !== undefined) {
      planParamsConstraint.tag = tag;
    }

    return {
      autobindOptions: undefined,
      operations: invalidation.operations,
      rootConstraints: planParamsConstraint,
      servicesBranch: [],
    };
  }

  #getOrBuildMapValueFromMapMap<TKey, TValue extends Map<unknown, unknown>>(
    map: Map<TKey, TValue>,
    key: TKey,
  ): TValue {
    let valueMap: TValue | undefined = map.get(key);

    if (valueMap === undefined) {
      valueMap = new Map() as TValue;
      map.set(key, valueMap);
    }

    return valueMap;
  }

  #getMapFromMapArray<TKey, TValue>(
    mapArray: Map<TKey, TValue>[],
    options: GetPlanOptions,
  ): Map<TKey, TValue> {
    return mapArray[this.#getMapArrayIndex(options)] as Map<TKey, TValue>;
  }

  #getMaps(): Map<ServiceIdentifier, unknown>[] {
    return [
      this.#serviceIdToNonCachedServiceNodeMapMap,
      ...this.#serviceIdToValuePlanMap,
      ...this.#namedServiceIdToValuePlanMap,
      ...this.#namedTaggedServiceIdToValuePlanMap,
      ...this.#taggedServiceIdToValuePlanMap,
    ];
  }

  #getMapArrayIndex(options: GetPlanOptions): number {
    if (options.isMultiple) {
      return (
        (options.chained ? CHAINED_MASK : 0) |
        (options.optional ? OPTIONAL_MASK : 0) |
        IS_MULTIPLE_MASK
      );
    } else {
      return options.optional ? OPTIONAL_MASK : 0;
    }
  }

  #invalidateNamedServiceMap(invalidation: CacheBindingInvalidation): void {
    for (const [index, map] of this.#namedServiceIdToValuePlanMap.entries()) {
      const servicePlans: Map<MetadataName, PlanResult> | undefined = map.get(
        invalidation.binding.serviceIdentifier,
      );

      if (servicePlans !== undefined) {
        for (const [name, servicePlan] of servicePlans.entries()) {
          this.#updatePlan(invalidation, servicePlan, index, name, undefined);
        }
      }
    }
  }

  #invalidateNamedTaggedServiceMap(
    invalidation: CacheBindingInvalidation,
  ): void {
    for (const [
      index,
      map,
    ] of this.#namedTaggedServiceIdToValuePlanMap.entries()) {
      const servicePlanMapMapMap:
        | Map<MetadataName, Map<MetadataTag, Map<unknown, PlanResult>>>
        | undefined = map.get(invalidation.binding.serviceIdentifier);

      if (servicePlanMapMapMap !== undefined) {
        for (const [
          name,
          servicePlanMapMap,
        ] of servicePlanMapMapMap.entries()) {
          for (const [tag, servicePlanMap] of servicePlanMapMap.entries()) {
            for (const [tagValue, servicePlan] of servicePlanMap.entries()) {
              this.#updatePlan(invalidation, servicePlan, index, name, {
                key: tag,
                value: tagValue,
              });
            }
          }
        }
      }
    }
  }

  #invalidateNonCachePlanBindingNodeDescendents(
    planBindingNode: PlanBindingNode,
  ): void {
    switch (planBindingNode.binding.type) {
      case bindingTypeValues.ServiceRedirection:
        for (const redirection of (
          planBindingNode as PlanServiceRedirectionBindingNode
        ).redirections) {
          this.#invalidateNonCachePlanBindingNodeDescendents(redirection);
        }
        break;
      case bindingTypeValues.Instance:
        for (const constructorParam of (planBindingNode as InstanceBindingNode)
          .constructorParams) {
          if (constructorParam !== undefined) {
            this.#invalidateNonCachePlanServiceNode(constructorParam);
          }
        }

        for (const propertyParam of (
          planBindingNode as InstanceBindingNode
        ).propertyParams.values()) {
          this.#invalidateNonCachePlanServiceNode(propertyParam);
        }

        break;

      case bindingTypeValues.ResolvedValue:
        for (const resolvedValue of (
          planBindingNode as ResolvedValueBindingNode
        ).params) {
          this.#invalidateNonCachePlanServiceNode(resolvedValue);
        }

        break;

      default:
    }
  }

  #invalidateNonCachePlanServiceNode(planServiceNode: PlanServiceNode): void {
    const serviceNonCachedMap:
      | Map<PlanServiceNode, NonCachedServiceNodeContext>
      | undefined = this.#serviceIdToNonCachedServiceNodeMapMap.get(
      planServiceNode.serviceIdentifier,
    );

    if (
      serviceNonCachedMap === undefined ||
      !serviceNonCachedMap.has(planServiceNode)
    ) {
      return;
    }

    serviceNonCachedMap.delete(planServiceNode);

    this.#invalidateNonCachePlanServiceNodeDescendents(planServiceNode);
  }

  #invalidateNonCachePlanServiceNodeDescendents(
    planServiceNode: PlanServiceNode,
  ): void {
    if (
      LazyPlanServiceNode.is(planServiceNode) &&
      !planServiceNode.isExpanded()
    ) {
      return;
    }

    if (planServiceNode.bindings === undefined) {
      return;
    }

    if (Array.isArray(planServiceNode.bindings)) {
      for (const binding of planServiceNode.bindings) {
        this.#invalidateNonCachePlanBindingNodeDescendents(binding);
      }
    } else {
      this.#invalidateNonCachePlanBindingNodeDescendents(
        planServiceNode.bindings,
      );
    }
  }

  #invalidateNonCachedServiceNodeSetMap(
    invalidation: CacheBindingInvalidation,
  ): void {
    const serviceNonCachedServiceNodeMap:
      | Map<PlanServiceNode, NonCachedServiceNodeContext>
      | undefined = this.#serviceIdToNonCachedServiceNodeMapMap.get(
      invalidation.binding.serviceIdentifier,
    );

    if (serviceNonCachedServiceNodeMap !== undefined) {
      switch (invalidation.kind) {
        case CacheBindingInvalidationKind.bindingAdded:
          for (const [serviceNode, context] of serviceNonCachedServiceNodeMap) {
            const result: PlanServiceNodeBindingAddedResult =
              addServiceNodeBindingIfContextFree(
                {
                  autobindOptions: undefined,
                  operations: invalidation.operations,
                  servicesBranch: [],
                },
                serviceNode,
                invalidation.binding,
                context.bindingConstraintsList,
                context.chainedBindings,
              );

            if (result.isContextFreeBinding) {
              if (
                result.shouldInvalidateServiceNode &&
                LazyPlanServiceNode.is(serviceNode)
              ) {
                this.#invalidateNonCachePlanServiceNodeDescendents(serviceNode);

                serviceNode.invalidate();
              }
            } else {
              this.clearCache();
            }
          }
          break;
        case CacheBindingInvalidationKind.bindingRemoved:
          for (const [serviceNode, context] of serviceNonCachedServiceNodeMap) {
            const result: PlanServiceNodeBindingRemovedResult =
              removeServiceNodeBindingIfContextFree(
                serviceNode,
                invalidation.binding,
                context.bindingConstraintsList,
                context.optionalBindings,
              );

            if (result.isContextFreeBinding) {
              if (result.bindingNodeRemoved !== undefined) {
                this.#invalidateNonCachePlanBindingNodeDescendents(
                  result.bindingNodeRemoved,
                );
              }
            } else {
              this.clearCache();
            }
          }
          break;
      }
    }
  }

  #invalidateServiceMap(invalidation: CacheBindingInvalidation): void {
    for (const [index, map] of this.#serviceIdToValuePlanMap.entries()) {
      const servicePlan: PlanResult | undefined = map.get(
        invalidation.binding.serviceIdentifier,
      );

      this.#updatePlan(invalidation, servicePlan, index, undefined, undefined);
    }
  }

  #invalidateTaggedServiceMap(invalidation: CacheBindingInvalidation): void {
    for (const [index, map] of this.#taggedServiceIdToValuePlanMap.entries()) {
      const servicePlanMapMap:
        | Map<MetadataTag, Map<unknown, PlanResult>>
        | undefined = map.get(invalidation.binding.serviceIdentifier);

      if (servicePlanMapMap !== undefined) {
        for (const [tag, servicePlanMap] of servicePlanMapMap.entries()) {
          for (const [tagValue, servicePlan] of servicePlanMap.entries()) {
            this.#updatePlan(invalidation, servicePlan, index, undefined, {
              key: tag,
              value: tagValue,
            });
          }
        }
      }
    }
  }

  #updatePlan(
    invalidation: CacheBindingInvalidation,
    servicePlan: PlanResult | undefined,
    index: number,
    name: MetadataName | undefined,
    tag: PlanParamsTagConstraint | undefined,
  ): void {
    if (
      servicePlan !== undefined &&
      LazyPlanServiceNode.is(servicePlan.tree.root)
    ) {
      const planParams: PlanParams = this.#buildUpdatePlanParams(
        invalidation,
        index,
        name,
        tag,
      );
      switch (invalidation.kind) {
        case CacheBindingInvalidationKind.bindingAdded:
          {
            const result: PlanServiceNodeBindingAddedResult =
              addRootServiceNodeBindingIfContextFree(
                planParams,
                servicePlan.tree.root,
                invalidation.binding,
              );

            if (result.isContextFreeBinding) {
              if (result.shouldInvalidateServiceNode) {
                this.#invalidateNonCachePlanServiceNodeDescendents(
                  servicePlan.tree.root,
                );

                servicePlan.tree.root.invalidate();
              }
            } else {
              this.clearCache();
            }
          }

          break;
        case CacheBindingInvalidationKind.bindingRemoved:
          {
            const result: PlanServiceNodeBindingRemovedResult =
              removeRootServiceNodeBindingIfContextFree(
                planParams,
                servicePlan.tree.root,
                invalidation.binding,
              );

            if (result.isContextFreeBinding) {
              if (result.bindingNodeRemoved !== undefined) {
                this.#invalidateNonCachePlanBindingNodeDescendents(
                  result.bindingNodeRemoved,
                );
              }
            } else {
              this.clearCache();
            }
          }

          break;
      }
    }
  }
}
