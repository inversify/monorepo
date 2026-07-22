import { type ActivationSubscriber } from '../../binding/models/ActivationSubscriber.js';
import { type bindingTypeValues } from '../../binding/models/BindingType.js';
import { type DynamicValueBinding } from '../../binding/models/DynamicValueBinding.js';
import { resolveScoped } from '../../resolution/actions/resolveScoped.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { buildNoActivationsDynamicValueBindingNodeResolver } from '../calculations/buildNoActivationsDynamicValueBindingNodeResolver.js';
import { type BasePlanParams } from './BasePlanParams.js';
import {
  type DynamicallyResolvableBindingNode,
  isDynamicallyResolvableBindingNodeSymbol,
} from './DynamicallyResolvableBindingNode.js';
import { type LeafBindingNode } from './LeafBindingNode.js';

const resolveScopedDynamicValueBindingNode: <TActivated>(
  node: LeafBindingNode<TActivated, DynamicValueBinding<TActivated>>,
) => (params: ResolutionParams) => Resolved<TActivated> = <TActivated>(
  node: LeafBindingNode<TActivated, DynamicValueBinding<TActivated>>,
) =>
  resolveScoped<
    TActivated,
    typeof bindingTypeValues.DynamicValue,
    DynamicValueBinding<TActivated>,
    LeafBindingNode<TActivated, DynamicValueBinding<TActivated>>
  >(
    node,
    (
      params: ResolutionParams,
      node: LeafBindingNode<TActivated, DynamicValueBinding<TActivated>>,
    ): Resolved<TActivated> => node.binding.value(params.context),
  );

export class DynamicValueBindingNode<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TActivated = any,
>
  implements
    LeafBindingNode<TActivated, DynamicValueBinding<TActivated>>,
    DynamicallyResolvableBindingNode<
      TActivated,
      DynamicValueBinding<TActivated>
    >,
    ActivationSubscriber
{
  public readonly [isDynamicallyResolvableBindingNodeSymbol]: true;
  public resolve: (params: ResolutionParams) => Resolved<TActivated>;

  #onResolverChangedHandlers:
    | ((
        newResolver: (params: ResolutionParams) => Resolved<TActivated>,
      ) => void)[]
    | undefined;

  constructor(
    public readonly binding: DynamicValueBinding<TActivated>,
    params: BasePlanParams,
  ) {
    this[isDynamicallyResolvableBindingNodeSymbol] = true;

    const areServiceActivations: boolean =
      params.operations.getActivations(binding.serviceIdentifier) !== undefined;

    this.#onResolverChangedHandlers = undefined;

    this.resolve = this.#buildDynamicValueBindingNodeResolver(
      areServiceActivations,
    );

    if (!areServiceActivations && this.#areNoBindingActivationsDefined()) {
      params.operations.subscribeActivationAddedOnce(
        binding.serviceIdentifier,
        this,
      );
    }
  }

  public onActivationAdded(): void {
    this.resolve = this.#buildDynamicValueBindingNodeResolver(true);

    if (this.#onResolverChangedHandlers !== undefined) {
      for (const handler of this.#onResolverChangedHandlers) {
        handler(this.resolve);
      }
    }
  }

  public addOnResolverChangedHandler(
    callback: (
      newResolver: (params: ResolutionParams) => Resolved<TActivated>,
    ) => void,
  ): void {
    if (this.#onResolverChangedHandlers === undefined) {
      this.#onResolverChangedHandlers = [];
    }

    this.#onResolverChangedHandlers.push(callback);
  }

  #buildDynamicValueBindingNodeResolver(
    areServiceActivations: boolean,
  ): (params: ResolutionParams) => Resolved<TActivated> {
    if (this.#areNoBindingActivationsDefined()) {
      return buildNoActivationsDynamicValueBindingNodeResolver(
        this,
        areServiceActivations,
      );
    }

    return resolveScopedDynamicValueBindingNode(this);
  }

  #areNoBindingActivationsDefined(): boolean {
    return this.binding.onActivation === undefined;
  }
}
