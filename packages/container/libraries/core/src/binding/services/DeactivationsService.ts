import { type ServiceIdentifier } from '@inversifyjs/common';

import { chain } from '../../common/calculations/chain.js';
import { type Cloneable } from '../../common/models/Cloneable.js';
import { OneToManyMapStar } from '../../common/models/OneToManyMapStar.js';
import { type BindingDeactivation } from '../models/BindingDeactivation.js';

enum DeactivationRelationKind {
  moduleId = 'moduleId',
  serviceId = 'serviceId',
}

export interface BindingDeactivationRelation {
  [DeactivationRelationKind.moduleId]?: number;
  [DeactivationRelationKind.serviceId]: ServiceIdentifier;
}

export class DeactivationsService implements Cloneable<DeactivationsService> {
  readonly #deactivationMaps: OneToManyMapStar<
    BindingDeactivation,
    BindingDeactivationRelation
  >;

  readonly #getParent: () => DeactivationsService | undefined;

  private constructor(
    getParent: () => DeactivationsService | undefined,
    deactivationMaps?: OneToManyMapStar<
      BindingDeactivation,
      BindingDeactivationRelation
    >,
  ) {
    this.#deactivationMaps =
      deactivationMaps ??
      new OneToManyMapStar<BindingDeactivation, BindingDeactivationRelation>({
        moduleId: {
          isOptional: true,
        },
        serviceId: {
          isOptional: false,
        },
      });

    this.#getParent = getParent;
  }

  public static build(
    getParent: () => DeactivationsService | undefined,
  ): DeactivationsService {
    return new DeactivationsService(getParent);
  }

  public add(
    deactivation: BindingDeactivation,
    relation: BindingDeactivationRelation,
  ): void {
    this.#deactivationMaps.add(deactivation, relation);
  }

  public clone(): DeactivationsService {
    const clone: DeactivationsService = new DeactivationsService(
      this.#getParent,
      this.#deactivationMaps.clone(),
    );

    return clone;
  }

  public get(
    serviceIdentifier: ServiceIdentifier,
  ): Iterable<BindingDeactivation> | undefined {
    const deactivationIterables: Iterable<BindingDeactivation>[] = [];

    const deactivations: Iterable<BindingDeactivation> | undefined =
      this.#deactivationMaps.get(
        DeactivationRelationKind.serviceId,
        serviceIdentifier,
      );

    if (deactivations !== undefined) {
      deactivationIterables.push(deactivations);
    }

    const parentDeactivations: Iterable<BindingDeactivation> | undefined =
      this.#getParent()?.get(serviceIdentifier);

    if (parentDeactivations !== undefined) {
      deactivationIterables.push(parentDeactivations);
    }

    if (deactivationIterables.length === 0) {
      return undefined;
    }

    return chain(...deactivationIterables);
  }

  public removeAllByModuleId(moduleId: number): void {
    this.#deactivationMaps.removeByRelation(
      DeactivationRelationKind.moduleId,
      moduleId,
    );
  }

  public removeAllByServiceId(serviceId: ServiceIdentifier): void {
    this.#deactivationMaps.removeByRelation(
      DeactivationRelationKind.serviceId,
      serviceId,
    );
  }
}
