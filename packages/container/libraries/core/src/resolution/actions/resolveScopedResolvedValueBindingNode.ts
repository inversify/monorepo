import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolvedValueBindingNode } from '../../planning/models/ResolvedValueBindingNode.js';
import { getResolvedValueNodeBinding } from '../calculations/getResolvedValueNodeBinding.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved } from '../models/Resolved.js';
import { resolveScoped } from './resolveScoped.js';

export const resolveScopedResolvedValueBindingNode: <TActivated>(
  resolve: (
    params: ResolutionParams,
    node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
  ) => Resolved<TActivated>,
) => (
  params: ResolutionParams,
  node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
) => Resolved<TActivated> = <TActivated>(
  resolve: (
    params: ResolutionParams,
    node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
  ) => Resolved<TActivated>,
) => resolveScoped(getResolvedValueNodeBinding, resolve);
