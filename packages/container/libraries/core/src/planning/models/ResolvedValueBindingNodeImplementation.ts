import { type ActivationSubscriber } from '../../binding/models/ActivationSubscriber.js';
import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { buildResolvedValueBindingNodeResolver } from '../calculations/buildResolvedValueBindingNodeResolver.js';
import { type BasePlanParams } from './BasePlanParams.js';
import {
  type DynamicallyResolvableBindingNode,
  isDynamicallyResolvableBindingNodeSymbol,
} from './DynamicallyResolvableBindingNode.js';
import { type PlanServiceNode } from './PlanServiceNode.js';
import { type ResolvedValueBindingNode } from './ResolvedValueBindingNode.js';

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

    this.resolve = buildResolvedValueBindingNodeResolver(
      this,
      areServiceActivations,
      this.#jitEnabled,
    );

    if (!areServiceActivations) {
      params.operations.subscribeActivationAddedOnce(
        binding.serviceIdentifier,
        this,
      );
    }
  }

  public onActivationAdded(): void {
    this.resolve = buildResolvedValueBindingNodeResolver(
      this,
      true,
      this.#jitEnabled,
    );

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
}
