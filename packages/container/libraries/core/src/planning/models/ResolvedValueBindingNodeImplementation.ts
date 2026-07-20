import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { buildResolvedValueBindingNodeResolver } from '../calculations/buildResolvedValueBindingNodeResolver.js';
import { type BasePlanParams } from './BasePlanParams.js';
import { type PlanServiceNode } from './PlanServiceNode.js';
import { type ResolvedValueBindingNode } from './ResolvedValueBindingNode.js';

export class ResolvedValueBindingNodeImplementation<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TActivated = any,
> implements ResolvedValueBindingNode<ResolvedValueBinding<TActivated>> {
  public readonly params: PlanServiceNode[];
  public readonly resolve: (params: ResolutionParams) => Resolved<TActivated>;

  constructor(
    public readonly binding: ResolvedValueBinding<TActivated>,
    params: BasePlanParams,
  ) {
    this.params = [];
    this.resolve = buildResolvedValueBindingNodeResolver(
      this,
      params.jitEnabled,
    );
  }
}
