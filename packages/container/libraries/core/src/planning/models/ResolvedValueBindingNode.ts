import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type PlanServiceNode } from './PlanServiceNode.js';
import { type ResolvableBindingNode } from './ResolvableBindingNode.js';

export interface ResolvedValueBindingNode<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TBinding extends ResolvedValueBinding<any> = ResolvedValueBinding<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
> extends ResolvableBindingNode<any, TBinding> {
  readonly params: PlanServiceNode[];
}
