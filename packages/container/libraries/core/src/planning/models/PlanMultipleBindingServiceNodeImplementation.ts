import { type ServiceIdentifier } from '@inversifyjs/common';

import { resolveMultipleBindingServiceNode } from '../../resolution/actions/resolveMultipleBindingServiceNode.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type PlanBindingNode } from './PlanBindingNode.js';
import { type PlanServiceNode } from './PlanServiceNode.js';

export class PlanMultipleBindingServiceNodeImplementation implements PlanServiceNode {
  public isContextFree: boolean;

  constructor(
    public readonly bindings: PlanBindingNode[],
    public readonly serviceIdentifier: ServiceIdentifier,
  ) {
    this.isContextFree = true;
  }

  public resolve(params: ResolutionParams): unknown {
    return resolveMultipleBindingServiceNode(params, this.bindings);
  }
}
