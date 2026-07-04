import { handleResolveError } from '../../planning/calculations/handleResolveError.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';

export function resolve(params: ResolutionParams): unknown {
  try {
    const serviceNode: PlanServiceNode = params.planResult.tree.root;

    return serviceNode.resolve(params);
  } catch (error: unknown) {
    handleResolveError(params, error);
  }
}
