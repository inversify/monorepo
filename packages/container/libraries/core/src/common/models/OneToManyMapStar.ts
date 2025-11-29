import { Cloneable } from './Cloneable';

const NOT_FOUND_INDEX: number = -1;

export type OneToManyMapStartSpec<TRelation extends object> = {
  [TKey in keyof TRelation]: {
    isOptional: undefined extends TRelation[TKey] ? true : false;
  };
};

type RelationToModelMap<TModel, TRelation extends object> = {
  [TKey in keyof TRelation]-?: Map<TRelation[TKey], TModel[]>;
};

/**
 * Data structure able to efficiently manage a set of models related to a set of properties in a one to many relation.
 */
export class OneToManyMapStar<
  TModel,
  TRelation extends object,
> implements Cloneable<OneToManyMapStar<TModel, TRelation>> {
  readonly #modelToRelationMap: Map<TModel, TRelation[]>;
  readonly #relationToModelsMaps: RelationToModelMap<TModel, TRelation>;
  readonly #spec: OneToManyMapStartSpec<TRelation>;

  constructor(spec: OneToManyMapStartSpec<TRelation>) {
    this.#modelToRelationMap = new Map();

    this.#relationToModelsMaps = {} as RelationToModelMap<TModel, TRelation>;

    for (const specProperty of Reflect.ownKeys(spec) as (keyof TRelation)[]) {
      this.#relationToModelsMaps[specProperty] = new Map();
    }

    this.#spec = spec;
  }

  public add(model: TModel, relation: TRelation): void {
    this.#buildOrGetModelArray(model).push(relation);

    for (const relationKey of Reflect.ownKeys(
      relation,
    ) as (keyof TRelation)[]) {
      this.#buildOrGetRelationModels(relationKey, relation[relationKey]).push(
        model,
      );
    }
  }

  public clone(): this {
    const modelToCloneModelMap: Map<TModel, TModel> =
      this.#buildModelToCloneModelMap();
    const relationToCloneRelationMap: Map<TRelation, TRelation> =
      this.#buildRelationToRelationModelMap();

    const properties: (keyof TRelation)[] = Reflect.ownKeys(
      this.#spec,
    ) as (keyof TRelation)[];

    const clone: this = this._buildNewInstance(this.#spec);

    this.#pushRelationEntriesIntoRelationMap(
      this.#modelToRelationMap,
      clone.#modelToRelationMap,
      modelToCloneModelMap,
      relationToCloneRelationMap,
    );

    for (const property of properties) {
      this.#pushModelEntriesIntoModelMap(
        this.#relationToModelsMaps[property],
        clone.#relationToModelsMaps[property],
        modelToCloneModelMap,
      );
    }

    return clone;
  }

  public get<TKey extends keyof TRelation>(
    key: TKey,
    value: Required<TRelation>[TKey],
  ): Iterable<TModel> | undefined {
    return this.#relationToModelsMaps[key].get(value);
  }

  public getAllKeys<TKey extends keyof TRelation>(
    key: TKey,
  ): Iterable<TRelation[TKey]> {
    return this.#relationToModelsMaps[key].keys();
  }

  public removeByRelation<TKey extends keyof TRelation>(
    key: TKey,
    value: Required<TRelation>[TKey],
  ): void {
    const models: Iterable<TModel> | undefined = this.get(key, value);

    if (models === undefined) {
      return;
    }

    const uniqueModelsSet: Set<TModel> = new Set(models);

    for (const model of uniqueModelsSet) {
      const relations: TRelation[] | undefined =
        this.#modelToRelationMap.get(model);

      if (relations === undefined) {
        throw new Error('Expecting model relation, none found');
      }

      for (const relation of relations) {
        if (relation[key] === value) {
          this.#removeModelFromRelationMaps(model, relation);
        }
      }

      this.#modelToRelationMap.delete(model);
    }
  }

  protected _buildNewInstance(spec: OneToManyMapStartSpec<TRelation>): this {
    return new OneToManyMapStar(spec) as this;
  }

  protected _cloneModel(model: TModel): TModel {
    return model;
  }

  protected _cloneRelation(relation: TRelation): TRelation {
    return relation;
  }

  #buildModelToCloneModelMap(): Map<TModel, TModel> {
    const modelToCloneModelMap: Map<TModel, TModel> = new Map();

    for (const model of this.#modelToRelationMap.keys()) {
      const clonedModel: TModel = this._cloneModel(model);
      modelToCloneModelMap.set(model, clonedModel);
    }

    return modelToCloneModelMap;
  }

  #buildRelationToRelationModelMap(): Map<TRelation, TRelation> {
    const relationToCloneRelationMap: Map<TRelation, TRelation> = new Map();

    for (const relations of this.#modelToRelationMap.values()) {
      for (const relation of relations) {
        const clonedRelation: TRelation = this._cloneRelation(relation);
        relationToCloneRelationMap.set(relation, clonedRelation);
      }
    }

    return relationToCloneRelationMap;
  }

  #buildOrGetModelArray(model: TModel): TRelation[] {
    let relations: TRelation[] | undefined =
      this.#modelToRelationMap.get(model);

    if (relations === undefined) {
      relations = [];

      this.#modelToRelationMap.set(model, relations);
    }

    return relations;
  }

  #buildOrGetRelationModels<TKey extends keyof TRelation>(
    relationKey: TKey,
    relationValue: TRelation[TKey],
  ): TModel[] {
    let models: TModel[] | undefined =
      this.#relationToModelsMaps[relationKey].get(relationValue);

    if (models === undefined) {
      models = [];

      this.#relationToModelsMaps[relationKey].set(relationValue, models);
    }

    return models;
  }

  #getCloneModel(
    model: TModel,
    modelToCloneModelMap: Map<TModel, TModel>,
  ): TModel {
    const clonedModel: TModel | undefined = modelToCloneModelMap.get(model);

    if (clonedModel === undefined) {
      throw new Error('Expecting model to be cloned, none found');
    }

    return clonedModel;
  }

  #getCloneRelation(
    relation: TRelation,
    relationToCloneRelationMap: Map<TRelation, TRelation>,
  ): TRelation {
    const clonedRelation: TRelation | undefined =
      relationToCloneRelationMap.get(relation);

    if (clonedRelation === undefined) {
      throw new Error('Expecting relation to be cloned, none found');
    }

    return clonedRelation;
  }

  #pushModelEntriesIntoModelMap(
    source: Map<TRelation[keyof TRelation], TModel[]>,
    target: Map<TRelation[keyof TRelation], TModel[]>,
    modelToCloneModelMap: Map<TModel, TModel>,
  ): void {
    for (const [relationValue, models] of source) {
      const modelsClone: TModel[] = new Array<TModel>();

      for (const model of models) {
        modelsClone.push(this.#getCloneModel(model, modelToCloneModelMap));
      }

      target.set(relationValue, modelsClone);
    }
  }

  #pushRelationEntriesIntoRelationMap(
    source: Map<TModel, TRelation[]>,
    target: Map<TModel, TRelation[]>,
    modelToCloneModelMap: Map<TModel, TModel>,
    relationToCloneRelationMap: Map<TRelation, TRelation>,
  ): void {
    for (const [model, relations] of source) {
      const relationsClone: TRelation[] = new Array<TRelation>();

      for (const relation of relations) {
        relationsClone.push(
          this.#getCloneRelation(relation, relationToCloneRelationMap),
        );
      }

      target.set(
        this.#getCloneModel(model, modelToCloneModelMap),
        relationsClone,
      );
    }
  }

  #removeModelFromRelationMaps(model: TModel, relation: TRelation): void {
    for (const relationKey of Reflect.ownKeys(
      relation,
    ) as (keyof TRelation)[]) {
      this.#removeModelFromRelationMap(
        model,
        relationKey,
        relation[relationKey],
      );
    }
  }

  #removeModelFromRelationMap<TKey extends keyof TRelation>(
    model: TModel,
    relationKey: TKey,
    relationValue: TRelation[TKey],
  ): void {
    const relationModels: TModel[] | undefined =
      this.#relationToModelsMaps[relationKey].get(relationValue);

    if (relationModels !== undefined) {
      const index: number = relationModels.indexOf(model);

      if (index !== NOT_FOUND_INDEX) {
        relationModels.splice(index, 1);
      }

      if (relationModels.length === 0) {
        this.#relationToModelsMaps[relationKey].delete(relationValue);
      }
    }
  }
}
