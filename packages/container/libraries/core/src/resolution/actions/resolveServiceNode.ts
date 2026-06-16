import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveMultipleBindingServiceNode } from './resolveMultipleBindingServiceNode.js';
import { resolveSingleBindingServiceNode } from './resolveSingleBindingServiceNode.js';

export function resolveServiceNode(
  params: ResolutionParams,
  serviceNode: PlanServiceNode,
): unknown {
  if (serviceNode.bindings === undefined) {
    return undefined;
  }

  if (Array.isArray(serviceNode.bindings)) {
    return resolveMultipleBindingServiceNode(params, serviceNode.bindings);
  }

  return resolveSingleBindingServiceNode(params, serviceNode.bindings);
}
