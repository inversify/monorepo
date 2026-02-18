import { type ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding.js';
import { type BaseBindingNode } from './BaseBindingNode.js';
import { type PlanBindingNode } from './PlanBindingNode.js';

export interface PlanServiceRedirectionBindingNode<
  TBinding extends
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ServiceRedirectionBinding<any> = ServiceRedirectionBinding<any>,
> extends BaseBindingNode<TBinding> {
  redirections: PlanBindingNode[];
}
