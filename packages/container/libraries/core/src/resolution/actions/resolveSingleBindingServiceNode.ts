import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { isPlanServiceRedirectionBindingNode } from '../../planning/calculations/isPlanServiceRedirectionBindingNode.js';
import { type PlanBindingNode } from '../../planning/models/PlanBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveServiceRedirectionBindingNode } from './resolveServiceRedirectionBindingNode.js';

export function resolveSingleBindingServiceNode(
  params: ResolutionParams,
  binding: PlanBindingNode,
): unknown {
  if (isPlanServiceRedirectionBindingNode(binding)) {
    const resolvedValues: unknown[] = resolveServiceRedirectionBindingNode(
      params,
      binding,
    );

    if (resolvedValues.length === 1) {
      return resolvedValues[0];
    } else {
      throw new InversifyCoreError(
        InversifyCoreErrorKind.resolution,
        'Unexpected multiple resolved values on single injection',
      );
    }
  } else {
    return binding.resolve(params);
  }
}
