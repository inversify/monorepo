import { type ConstantValueBinding } from '../../binding/models/ConstantValueBinding.js';
import { resolveScoped } from '../../resolution/actions/resolveScoped.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type LeafBindingNode } from './LeafBindingNode.js';

export class ConstantValueBindingNode<TActivated> implements LeafBindingNode<
  TActivated,
  ConstantValueBinding<TActivated>
> {
  public readonly resolve: (params: ResolutionParams) => Resolved<TActivated>;

  constructor(public readonly binding: ConstantValueBinding<TActivated>) {
    this.resolve = resolveScoped(
      this,
      (
        _params: ResolutionParams,
        node: LeafBindingNode<TActivated, ConstantValueBinding<TActivated>>,
      ): Resolved<TActivated> => node.binding.value,
    );
  }
}
