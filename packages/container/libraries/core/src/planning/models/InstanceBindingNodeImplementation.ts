import { type ActivationSubscriber } from '../../binding/models/ActivationSubscriber.js';
import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type ClassMetadata } from '../../metadata/models/ClassMetadata.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { buildInstanceBindingNodeResolver } from '../calculations/buildInstanceBindingNodeResolver.js';
import { type BasePlanParams } from './BasePlanParams.js';
import { type ConstructorNoParamNode } from './ConstructorNoParamNode.js';
import {
  type DynamicallyResolvableBindingNode,
  isDynamicallyResolvableBindingNodeSymbol,
} from './DynamicallyResolvableBindingNode.js';
import { type InstanceBindingNode } from './InstanceBindingNode.js';
import { type PlanServiceNode } from './PlanServiceNode.js';

export class InstanceBindingNodeImplementation<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TActivated = any,
>
  implements
    InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
    DynamicallyResolvableBindingNode<TActivated, InstanceBinding<TActivated>>,
    ActivationSubscriber
{
  public readonly [isDynamicallyResolvableBindingNodeSymbol]: true;
  public readonly constructorParams: (
    PlanServiceNode | ConstructorNoParamNode
  )[];
  public readonly propertyParams: Map<string | symbol, PlanServiceNode>;
  public resolve: (params: ResolutionParams) => Resolved<TActivated>;

  readonly #jitEnabled: boolean;
  #onResolverChangedHandlers:
    | ((
        newResolver: (params: ResolutionParams) => Resolved<TActivated>,
      ) => void)[]
    | undefined;
  #resolveImpl: (params: ResolutionParams) => Resolved<TActivated>;

  constructor(
    public readonly binding: InstanceBinding<TActivated>,
    public readonly classMetadata: ClassMetadata,
    params: BasePlanParams,
  ) {
    this[isDynamicallyResolvableBindingNodeSymbol] = true;
    this.constructorParams = [];
    this.propertyParams = new Map();

    this.#jitEnabled = params.jitEnabled;
    const areServiceActivations: boolean =
      params.operations.getActivations(binding.serviceIdentifier) !== undefined;

    this.#onResolverChangedHandlers = undefined;

    this.#resolveImpl = buildInstanceBindingNodeResolver(
      this,
      areServiceActivations,
      this.#jitEnabled,
    );

    this.resolve = this.#resolveImpl;

    if (!areServiceActivations) {
      params.operations.subscribeActivationAddedOnce(
        binding.serviceIdentifier,
        this,
      );
    }
  }

  public onActivationAdded(): void {
    this.#resolveImpl = buildInstanceBindingNodeResolver(
      this,
      true,
      this.#jitEnabled,
    );

    if (this.#onResolverChangedHandlers !== undefined) {
      for (const handler of this.#onResolverChangedHandlers) {
        handler(this.#resolveImpl);
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
