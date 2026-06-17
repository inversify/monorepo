import { isPromise } from '@inversifyjs/common';

import { isPlanServiceRedirectionBindingNode } from '../../planning/calculations/isPlanServiceRedirectionBindingNode.js';
import { type PlanBindingNode } from '../../planning/models/PlanBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveServiceRedirectionBindingNode } from './resolveServiceRedirectionBindingNode.js';

export function resolveMultipleBindingServiceNode(
  params: ResolutionParams,
  bindings: PlanBindingNode[],
): unknown[] | Promise<unknown[]> {
  const resolvedValues: unknown[] = [];

  for (const binding of bindings) {
    if (isPlanServiceRedirectionBindingNode(binding)) {
      resolvedValues.push(
        ...resolveServiceRedirectionBindingNode(params, binding),
      );
    } else {
      resolvedValues.push(binding.resolve(params));
    }
  }

  if (resolvedValues.some(isPromise)) {
    return Promise.all(resolvedValues);
  }

  return resolvedValues;
}
