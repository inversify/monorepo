import { type Binding } from '../../binding/models/Binding.js';
import { type Factory } from '../../binding/models/Factory.js';
import { type FactoryBinding } from '../../binding/models/FactoryBinding.js';
import { resolveScoped } from '../../resolution/actions/resolveScoped.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type BaseBindingNode } from './BaseBindingNode.js';
import { type FactoryBindingNode } from './FactoryBindingNode.js';

export class FactoryBindingNodeImplementation<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TActivated extends Factory<unknown> = any,
> implements FactoryBindingNode<TActivated, FactoryBinding<TActivated>> {
  public readonly resolve: (params: ResolutionParams) => Resolved<TActivated>;

  constructor(public readonly binding: FactoryBinding<TActivated>) {
    this.resolve = resolveScoped(
      this as unknown as BaseBindingNode<
        FactoryBinding<TActivated> & Binding<TActivated>
      > &
        FactoryBindingNode<TActivated, FactoryBinding<TActivated>>,
      (
        params: ResolutionParams,
        node: FactoryBindingNode<TActivated, FactoryBinding<TActivated>>,
      ): Resolved<TActivated> => node.binding.factory(params.context),
    );
  }
}
