import { type ActivationSubscriber } from '../../binding/models/ActivationSubscriber.js';
import { bindingScopeValues } from '../../binding/models/BindingScope.js';
import { type bindingTypeValues } from '../../binding/models/BindingType.js';
import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { resolveResolvedValueBindingNode } from '../../resolution/actions/resolveResolvedValueBindingNode.js';
import { resolveScoped } from '../../resolution/actions/resolveScoped.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { buildNoActivationsResolvedValueBindingNodeResolver } from '../calculations/buildNoActivationsResolvedValueBindingNodeResolver.js';
import { buildNoActivationsResolvedValueBindingNodeResolverJit } from '../calculations/buildNoActivationsResolvedValueBindingNodeResolverJit.js';
import { type BasePlanParams } from './BasePlanParams.js';
import {
  type DynamicallyResolvableBindingNode,
  isDynamicallyResolvableBindingNodeSymbol,
} from './DynamicallyResolvableBindingNode.js';
import { type PlanServiceNode } from './PlanServiceNode.js';
import { type ResolvedValueBindingNode } from './ResolvedValueBindingNode.js';

const resolveScopedResolvedValueBindingNode: <TActivated>(
  node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
) => (params: ResolutionParams) => Resolved<TActivated> = <TActivated>(
  node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
) =>
  resolveScoped<
    TActivated,
    typeof bindingTypeValues.ResolvedValue,
    ResolvedValueBinding<TActivated>,
    ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>
  >(node, resolveResolvedValueBindingNode);

export class ResolvedValueBindingNodeImplementation<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TActivated = any,
>
  implements
    ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
    DynamicallyResolvableBindingNode<
      TActivated,
      ResolvedValueBinding<TActivated>
    >,
    ActivationSubscriber
{
  public readonly [isDynamicallyResolvableBindingNodeSymbol]: true;
  public readonly params: PlanServiceNode[];
  public resolve: (params: ResolutionParams) => Resolved<TActivated>;

  readonly #jitEnabled: boolean;
  #onResolverChangedHandlers:
    | ((
        newResolver: (params: ResolutionParams) => Resolved<TActivated>,
      ) => void)[]
    | undefined;

  constructor(
    public readonly binding: ResolvedValueBinding<TActivated>,
    params: BasePlanParams,
  ) {
    this[isDynamicallyResolvableBindingNodeSymbol] = true;
    this.params = [];

    this.#jitEnabled = params.jitEnabled;
    const areServiceActivations: boolean =
      params.operations.getActivations(binding.serviceIdentifier) !== undefined;

    this.#onResolverChangedHandlers = undefined;

    this.resolve = this.#buildResolvedValueBindingNodeResolver(
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
    this.resolve = this.#buildResolvedValueBindingNodeResolver(true);

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

  #buildResolvedValueBindingNodeResolver(
    areServiceActivations: boolean,
  ): (params: ResolutionParams) => Resolved<TActivated> {
    if (this.#areNoBindingActivationsDefined()) {
      if (
        this.#jitEnabled &&
        this.binding.scope !== bindingScopeValues.Singleton
      ) {
        return buildNoActivationsResolvedValueBindingNodeResolverJit(
          this,
          areServiceActivations,
        );
      } else {
        return buildNoActivationsResolvedValueBindingNodeResolver(
          this,
          areServiceActivations,
        );
      }
    }

    return resolveScopedResolvedValueBindingNode(this);
  }

  #areNoBindingActivationsDefined(): boolean {
    return this.binding.onActivation === undefined;
  }
}
