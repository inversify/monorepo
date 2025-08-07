import { ServiceIdentifier } from '@inversifyjs/common';

import { bindingTypeValues } from '../../binding/models/BindingType';
import { WeakList } from '../../common/models/WeakList';
import { MetadataName } from '../../metadata/models/MetadataName';
import { MetadataTag } from '../../metadata/models/MetadataTag';
import { GetPlanOptions } from '../models/GetPlanOptions';
import { InstanceBindingNode } from '../models/InstanceBindingNode';
import { LazyPlanServiceNode } from '../models/LazyPlanServiceNode';
import { NonCachedServiceNodeContext } from '../models/NonCachedServiceNodeContext';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { PlanResult } from '../models/PlanResult';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { PlanServiceRedirectionBindingNode } from '../models/PlanServiceRedirectionBindingNode';
import { ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode';

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

  public invalidateService(serviceIdentifier: ServiceIdentifier): void {
    this.#invalidateServiceMap(serviceIdentifier);
    this.#invalidateNamedServiceMap(serviceIdentifier);
    this.#invalidateNamedTaggedServiceMap(serviceIdentifier);
    this.#invalidateTaggedServiceMap(serviceIdentifier);
    this.#invalidateNonCachedServiceNodeSetMap(serviceIdentifier);

    for (const subscriber of this.#subscribers) {
      subscriber.invalidateService(serviceIdentifier);
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

  #invalidateNamedServiceMap(serviceIdentifier: ServiceIdentifier): void {
    for (const map of this.#namedServiceIdToValuePlanMap) {
      const servicePlans: Map<MetadataName, PlanResult> | undefined =
        map.get(serviceIdentifier);

      if (servicePlans !== undefined) {
        for (const servicePlan of servicePlans.values()) {
          if (LazyPlanServiceNode.is(servicePlan.tree.root)) {
            this.#invalidateNonCachePlanServiceNodeDescendents(
              servicePlan.tree.root,
            );

            servicePlan.tree.root.invalidate();
          }
        }
      }
    }
  }

  #invalidateNamedTaggedServiceMap(serviceIdentifier: ServiceIdentifier): void {
    for (const map of this.#namedTaggedServiceIdToValuePlanMap) {
      const servicePlanMapMapMap:
        | Map<MetadataName, Map<MetadataTag, Map<unknown, PlanResult>>>
        | undefined = map.get(serviceIdentifier);

      if (servicePlanMapMapMap !== undefined) {
        for (const servicePlanMapMap of servicePlanMapMapMap.values()) {
          for (const servicePlanMap of servicePlanMapMap.values()) {
            for (const servicePlan of servicePlanMap.values()) {
              if (LazyPlanServiceNode.is(servicePlan.tree.root)) {
                this.#invalidateNonCachePlanServiceNodeDescendents(
                  servicePlan.tree.root,
                );

                servicePlan.tree.root.invalidate();
              }
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
    serviceIdentifier: ServiceIdentifier,
  ): void {
    const serviceNonCachedServiceNodeMap:
      | Map<PlanServiceNode, NonCachedServiceNodeContext>
      | undefined =
      this.#serviceIdToNonCachedServiceNodeMapMap.get(serviceIdentifier);

    if (serviceNonCachedServiceNodeMap !== undefined) {
      for (const serviceNode of serviceNonCachedServiceNodeMap.keys()) {
        if (LazyPlanServiceNode.is(serviceNode)) {
          this.#invalidateNonCachePlanServiceNodeDescendents(serviceNode);

          serviceNode.invalidate();
        }
      }
    }
  }

  #invalidateServiceMap(serviceIdentifier: ServiceIdentifier): void {
    for (const map of this.#serviceIdToValuePlanMap) {
      const servicePlan: PlanResult | undefined = map.get(serviceIdentifier);

      if (
        servicePlan !== undefined &&
        LazyPlanServiceNode.is(servicePlan.tree.root)
      ) {
        this.#invalidateNonCachePlanServiceNodeDescendents(
          servicePlan.tree.root,
        );

        servicePlan.tree.root.invalidate();
      }
    }
  }

  #invalidateTaggedServiceMap(serviceIdentifier: ServiceIdentifier): void {
    for (const map of this.#taggedServiceIdToValuePlanMap) {
      const servicePlanMapMap:
        | Map<MetadataTag, Map<unknown, PlanResult>>
        | undefined = map.get(serviceIdentifier);

      if (servicePlanMapMap !== undefined) {
        for (const servicePlanMap of servicePlanMapMap.values()) {
          for (const servicePlan of servicePlanMap.values()) {
            if (LazyPlanServiceNode.is(servicePlan.tree.root)) {
              this.#invalidateNonCachePlanServiceNodeDescendents(
                servicePlan.tree.root,
              );

              servicePlan.tree.root.invalidate();
            }
          }
        }
      }
    }
  }
}
