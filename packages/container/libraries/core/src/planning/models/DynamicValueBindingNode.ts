import { type DynamicValueBinding } from '../../binding/models/DynamicValueBinding.js';
import { resolveScoped } from '../../resolution/actions/resolveScoped.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type LeafBindingNode } from './LeafBindingNode.js';

export class DynamicValueBindingNode<TActivated> implements LeafBindingNode<
  TActivated,
  DynamicValueBinding<TActivated>
> {
  public readonly resolve: (params: ResolutionParams) => Resolved<TActivated>;

  constructor(public readonly binding: DynamicValueBinding<TActivated>) {
    this.resolve = resolveScoped(
      this,
      (
        params: ResolutionParams,
        node: LeafBindingNode<TActivated, DynamicValueBinding<TActivated>>,
      ): Resolved<TActivated> => node.binding.value(params.context),
    );
  }
}
