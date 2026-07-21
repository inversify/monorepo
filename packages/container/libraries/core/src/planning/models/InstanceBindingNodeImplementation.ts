import { type ActivationSubscriber } from '../../binding/models/ActivationSubscriber.js';
import { bindingScopeValues } from '../../binding/models/BindingScope.js';
import { type bindingTypeValues } from '../../binding/models/BindingType.js';
import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type ClassMetadata } from '../../metadata/models/ClassMetadata.js';
import { resolveInstanceBindingConstructorParams } from '../../resolution/actions/resolveInstanceBindingConstructorParams.js';
import { resolveInstanceBindingNode as curryResolveInstanceBindingNode } from '../../resolution/actions/resolveInstanceBindingNode.js';
import { resolveInstanceBindingNodeAsyncFromConstructorParams } from '../../resolution/actions/resolveInstanceBindingNodeAsyncFromConstructorParams.js';
import { resolveInstanceBindingNodeFromConstructorParams } from '../../resolution/actions/resolveInstanceBindingNodeFromConstructorParams.js';
import { resolveScoped } from '../../resolution/actions/resolveScoped.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { buildNoActivationsInstanceBindingNodeResolver } from '../calculations/buildNoActivationsInstanceBindingNodeResolver.js';
import { buildNoActivationsInstanceBindingNodeResolverJit } from '../calculations/buildNoActivationsInstanceBindingNodeResolverJit.js';
import { type BasePlanParams } from './BasePlanParams.js';
import { type ConstructorNoParamNode } from './ConstructorNoParamNode.js';
import {
  type DynamicallyResolvableBindingNode,
  isDynamicallyResolvableBindingNodeSymbol,
} from './DynamicallyResolvableBindingNode.js';
import { type InstanceBindingNode } from './InstanceBindingNode.js';
import { type PlanServiceNode } from './PlanServiceNode.js';

const resolveInstanceBindingNode: <
  TActivated,
  TBinding extends InstanceBinding<TActivated> = InstanceBinding<TActivated>,
>(
  params: ResolutionParams,
  node: InstanceBindingNode<TActivated, TBinding>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Resolved<TActivated> = curryResolveInstanceBindingNode<any, any>(
  resolveInstanceBindingConstructorParams,
  resolveInstanceBindingNodeAsyncFromConstructorParams,
  resolveInstanceBindingNodeFromConstructorParams,
);

const resolveScopedInstanceBindingNode: <TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
) => (params: ResolutionParams) => Resolved<TActivated> = <TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
) =>
  resolveScoped<
    TActivated,
    typeof bindingTypeValues.Instance,
    InstanceBinding<TActivated>,
    InstanceBindingNode<TActivated, InstanceBinding<TActivated>>
  >(node, resolveInstanceBindingNode);

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

    this.resolve = this.#buildInstanceBindingNodeResolver(
      areServiceActivations,
    );

    if (
      !areServiceActivations &&
      this.#areNoBindingActivationsNorPostConstructsDefined()
    ) {
      params.operations.subscribeActivationAddedOnce(
        binding.serviceIdentifier,
        this,
      );
    }
  }

  public onActivationAdded(): void {
    this.resolve = this.#buildInstanceBindingNodeResolver(true);

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

  #buildInstanceBindingNodeResolver(
    areServiceActivations: boolean,
  ): (params: ResolutionParams) => Resolved<TActivated> {
    if (this.#areNoBindingActivationsNorPostConstructsDefined()) {
      if (
        this.#jitEnabled &&
        this.binding.scope !== bindingScopeValues.Singleton
      ) {
        return buildNoActivationsInstanceBindingNodeResolverJit(
          this,
          areServiceActivations,
        );
      } else {
        return buildNoActivationsInstanceBindingNodeResolver(
          this,
          areServiceActivations,
        );
      }
    }

    return resolveScopedInstanceBindingNode(this);
  }

  #areNoBindingActivationsNorPostConstructsDefined(): boolean {
    return (
      this.classMetadata.lifecycle.postConstructMethodNames.size === 0 &&
      this.binding.onActivation === undefined
    );
  }
}
