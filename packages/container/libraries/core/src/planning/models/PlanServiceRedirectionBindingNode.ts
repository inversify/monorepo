import { type ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding.js';
import { type PlanServiceNode } from './PlanServiceNode.js';
import { type ResolvableBindingNode } from './ResolvableBindingNode.js';

export interface PlanServiceRedirectionBindingNode<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TActivated = any,
  TBinding extends ServiceRedirectionBinding<TActivated> =
    ServiceRedirectionBinding<TActivated>,
> extends ResolvableBindingNode<TActivated, TBinding> {
  redirection: PlanServiceNode;
}
