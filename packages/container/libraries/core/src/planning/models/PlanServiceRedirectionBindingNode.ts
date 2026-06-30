import { type ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding.js';
import { type BaseBindingNode } from './BaseBindingNode.js';
import { type PlanServiceNode } from './PlanServiceNode.js';

export interface PlanServiceRedirectionBindingNode<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TActivated = any,
  TBinding extends ServiceRedirectionBinding<TActivated> =
    ServiceRedirectionBinding<TActivated>,
> extends BaseBindingNode<TBinding> {
  redirection: PlanServiceNode;
}
