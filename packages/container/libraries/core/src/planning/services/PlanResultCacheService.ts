import { ServiceIdentifier } from '@inversifyjs/common';

import { MetadataName } from '../../metadata/models/MetadataName';
import { MetadataTag } from '../../metadata/models/MetadataTag';
import { PlanResult } from '../models/PlanResult';

enum GetPlanBooleanOptionsMask {
  singleMandatory = 0,
  singleOptional = 1,
  multipleMandatory = 2,
  multipleOptional = 3,
  // Must be the last one
  length = 4,
}

interface GetPlanOptionsTagConstraint {
  key: MetadataTag;
  value: unknown;
}

export interface GetPlanOptions {
  serviceIdentifier: ServiceIdentifier;
  isMultiple: boolean;
  name: MetadataName | undefined;
  optional: boolean | undefined;
  tag: GetPlanOptionsTagConstraint | undefined;
}

const MIN_REFS_FOR_REALLOCATION: number = 8;
const MIN_DEAD_REFS_FOR_REALLOCATION_PERCENTAGE: number = 0.5;
function shouldReallocate(liveRefCount: number, refCount: number): boolean {
  return (
    refCount > MIN_REFS_FOR_REALLOCATION &&
    refCount - liveRefCount >
      refCount * MIN_DEAD_REFS_FOR_REALLOCATION_PERCENTAGE
  );
}

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
  readonly #serviceIdToValuePlanMap: Map<ServiceIdentifier, PlanResult>[];

  readonly #namedServiceIdToValuePlanMap: Map<
    ServiceIdentifier,
    Map<MetadataName, PlanResult>
  >[];

  readonly #taggedServiceIdToValuePlanMap: Map<
    ServiceIdentifier,
    Map<MetadataTag, Map<unknown, PlanResult>>
  >[];

  readonly #namedTaggedServiceIdToValuePlanMap: Map<
    ServiceIdentifier,
    Map<MetadataName, Map<MetadataTag, Map<unknown, PlanResult>>>
  >[];

  #subscribers: WeakRef<PlanResultCacheService>[];

  constructor() {
    this.#serviceIdToValuePlanMap = this.#buildInitializedMapArray();
    this.#namedServiceIdToValuePlanMap = this.#buildInitializedMapArray();
    this.#namedTaggedServiceIdToValuePlanMap = this.#buildInitializedMapArray();
    this.#taggedServiceIdToValuePlanMap = this.#buildInitializedMapArray();

    this.#subscribers = [];
  }

  public clearCache(): void {
    for (const map of this.#getMaps()) {
      map.clear();
    }

    let liveRefCount: number = 0;
    for (const subscriberRef of this.#subscribers) {
      const subscriber: PlanResultCacheService | undefined =
        subscriberRef.deref();
      if (subscriber) {
        subscriber.clearCache();
        ++liveRefCount;
      }
    }

    if (shouldReallocate(liveRefCount, this.#subscribers.length)) {
      this.#compactSubscribersArray(liveRefCount);
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

  public subscribe(subscriber: PlanResultCacheService): void {
    this.#subscribers.push(new WeakRef(subscriber));
  }

  #buildInitializedMapArray<TKey, TValue>(): Map<TKey, TValue>[] {
    const mapArray: Map<TKey, TValue>[] = new Array<Map<TKey, TValue>>(
      GetPlanBooleanOptionsMask.length,
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

  #getMaps(): Map<unknown, unknown>[] {
    return [
      ...this.#serviceIdToValuePlanMap,
      ...this.#namedServiceIdToValuePlanMap,
      ...this.#namedTaggedServiceIdToValuePlanMap,
      ...this.#taggedServiceIdToValuePlanMap,
    ];
  }

  #getMapArrayIndex(options: GetPlanOptions): number {
    if (options.isMultiple) {
      if (options.optional === true) {
        return GetPlanBooleanOptionsMask.multipleOptional;
      } else {
        return GetPlanBooleanOptionsMask.multipleMandatory;
      }
    } else {
      if (options.optional === true) {
        return GetPlanBooleanOptionsMask.singleOptional;
      } else {
        return GetPlanBooleanOptionsMask.singleMandatory;
      }
    }
  }

  #compactSubscribersArray(liveRefCount: number): void {
    const newSubscribers: WeakRef<PlanResultCacheService>[] = new Array<
      WeakRef<PlanResultCacheService>
    >(liveRefCount);
    let i: number = 0;
    for (const ref of this.#subscribers) {
      if (ref.deref()) {
        newSubscribers[i] = ref;
        ++i;
      }
    }
    this.#subscribers = newSubscribers;
  }
}
