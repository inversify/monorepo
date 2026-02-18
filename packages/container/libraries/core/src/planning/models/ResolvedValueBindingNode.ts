import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type BaseBindingNode } from './BaseBindingNode.js';
import { type PlanServiceNode } from './PlanServiceNode.js';

export interface ResolvedValueBindingNode<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TBinding extends ResolvedValueBinding<any> = ResolvedValueBinding<any>,
> extends BaseBindingNode<TBinding> {
  readonly params: PlanServiceNode[];
}
