import { type bindingTypeValues } from '../../binding/models/BindingType.js';
import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { resolveResolvedValueBindingNode } from '../../resolution/actions/resolveResolvedValueBindingNode.js';
import { resolveScoped } from '../../resolution/actions/resolveScoped.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type PlanServiceNode } from './PlanServiceNode.js';
import { type ResolvedValueBindingNode } from './ResolvedValueBindingNode.js';

export class ResolvedValueBindingNodeImplementation<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TActivated = any,
> implements ResolvedValueBindingNode<ResolvedValueBinding<TActivated>> {
  public readonly params: PlanServiceNode[];
  public readonly resolve: (params: ResolutionParams) => Resolved<TActivated>;

  constructor(public readonly binding: ResolvedValueBinding<TActivated>) {
    this.params = [];
    this.resolve = resolveScoped<
      TActivated,
      typeof bindingTypeValues.ResolvedValue,
      ResolvedValueBinding<TActivated>,
      ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>
    >(this, resolveResolvedValueBindingNode);
  }
}
