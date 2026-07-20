import { type ServiceIdentifier } from '@inversifyjs/common';

import { chain } from '../../common/calculations/chain.js';
import { type Cloneable } from '../../common/models/Cloneable.js';
import { OneToManyMapStar } from '../../common/models/OneToManyMapStar.js';
import { WeakList } from '../../common/models/WeakList.js';
import { type ActivationSubscriber } from '../models/ActivationSubscriber.js';
import { type BindingActivation } from '../models/BindingActivation.js';

enum ActivationRelationKind {
  moduleId = 'moduleId',
  serviceId = 'serviceId',
}

export interface BindingActivationRelation {
  [ActivationRelationKind.moduleId]?: number;
  [ActivationRelationKind.serviceId]: ServiceIdentifier;
}

export class ActivationsService implements Cloneable<ActivationsService> {
  readonly #activationMaps: OneToManyMapStar<
    BindingActivation,
    BindingActivationRelation
  >;
  readonly #getParent: () => ActivationsService | undefined;
  readonly #serviceToActivationSubscribersOnceMap: Map<
    ServiceIdentifier,
    WeakList<ActivationSubscriber>
  >;

  private constructor(
    getParent: () => ActivationsService | undefined,
    activationMaps?: OneToManyMapStar<
      BindingActivation,
      BindingActivationRelation
    >,
  ) {
    this.#activationMaps =
      activationMaps ??
      new OneToManyMapStar<BindingActivation, BindingActivationRelation>({
        moduleId: {
          isOptional: true,
        },
        serviceId: {
          isOptional: false,
        },
      });

    this.#getParent = getParent;
    // We don't want to clone subscribers
    this.#serviceToActivationSubscribersOnceMap = new Map();
  }

  public static build(
    getParent: () => ActivationsService | undefined,
  ): ActivationsService {
    return new ActivationsService(getParent);
  }

  public add(
    activation: BindingActivation,
    relation: BindingActivationRelation,
  ): void {
    this.#activationMaps.add(activation, relation);

    this.#triggerActivationAdded(
      relation[ActivationRelationKind.serviceId],
      activation,
    );
  }

  public subscribeOnce(
    serviceIdentifier: ServiceIdentifier,
    subscriber: ActivationSubscriber,
  ): void {
    let subscribersOnce: WeakList<ActivationSubscriber> | undefined =
      this.#serviceToActivationSubscribersOnceMap.get(serviceIdentifier);

    if (subscribersOnce === undefined) {
      subscribersOnce = new WeakList();
      this.#serviceToActivationSubscribersOnceMap.set(
        serviceIdentifier,
        subscribersOnce,
      );
    }

    subscribersOnce.push(subscriber);
  }

  public clone(): ActivationsService {
    const clone: ActivationsService = new ActivationsService(
      this.#getParent,
      this.#activationMaps.clone(),
    );

    return clone;
  }

  public get(
    serviceIdentifier: ServiceIdentifier,
  ): Iterable<BindingActivation> | undefined {
    const activations: Iterable<BindingActivation> | undefined =
      this.#activationMaps.get(
        ActivationRelationKind.serviceId,
        serviceIdentifier,
      );

    const parentActivations: Iterable<BindingActivation> | undefined =
      this.#getParent()?.get(serviceIdentifier);

    if (activations === undefined) {
      return parentActivations;
    }

    if (parentActivations === undefined) {
      return activations;
    }

    return chain(activations, parentActivations);
  }

  public removeAllByModuleId(moduleId: number): void {
    this.#activationMaps.removeByRelation(
      ActivationRelationKind.moduleId,
      moduleId,
    );
  }

  public removeAllByServiceId(serviceId: ServiceIdentifier): void {
    this.#activationMaps.removeByRelation(
      ActivationRelationKind.serviceId,
      serviceId,
    );
  }

  #triggerActivationAdded(
    serviceId: ServiceIdentifier,
    activation: BindingActivation,
  ): void {
    const subscribersOnce: WeakList<ActivationSubscriber> | undefined =
      this.#serviceToActivationSubscribersOnceMap.get(serviceId);

    if (subscribersOnce !== undefined) {
      for (const subscriber of subscribersOnce) {
        subscriber.onActivationAdded(serviceId, activation);
      }

      this.#serviceToActivationSubscribersOnceMap.delete(serviceId);
    }
  }
}
