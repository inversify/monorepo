import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type InstanceBindingNode } from '../../planning/models/InstanceBindingNode.js';
import { getInstanceNodeBinding } from '../calculations/getInstanceNodeBinding.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved } from '../models/Resolved.js';
import { resolveScoped } from './resolveScoped.js';

export const resolveScopedInstanceBindingNode: <TActivated>(
  resolve: (
    params: ResolutionParams,
    node: InstanceBindingNode<InstanceBinding<TActivated>>,
  ) => Resolved<TActivated>,
) => (
  params: ResolutionParams,
  node: InstanceBindingNode<InstanceBinding<TActivated>>,
) => Resolved<TActivated> = <TActivated>(
  resolve: (
    params: ResolutionParams,
    node: InstanceBindingNode<InstanceBinding<TActivated>>,
  ) => Resolved<TActivated>,
) => resolveScoped(getInstanceNodeBinding, resolve);
