import { handleResolveError } from '../../planning/calculations/handleResolveError.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveServiceNode } from './resolveServiceNode.js';

export function resolve(params: ResolutionParams): unknown {
  try {
    const serviceNode: PlanServiceNode = params.planResult.tree.root;

    return resolveServiceNode(params, serviceNode);
  } catch (error: unknown) {
    handleResolveError(params, error);
  }
}
