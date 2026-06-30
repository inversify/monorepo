import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding.js';
import { type InstanceBindingNode } from './InstanceBindingNode.js';
import { type PlanServiceRedirectionBindingNode } from './PlanServiceRedirectionBindingNode.js';
import { type ResolvedValueBindingNode } from './ResolvedValueBindingNode.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PlanServiceNodeParent<TActivated = any> =
  | InstanceBindingNode<TActivated, InstanceBinding<TActivated>>
  | PlanServiceRedirectionBindingNode<
      TActivated,
      ServiceRedirectionBinding<TActivated>
    >
  | ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>;
