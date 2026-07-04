import { type ServiceIdentifier } from '@inversifyjs/common';

import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type PlanBindingNode } from './PlanBindingNode.js';

export interface PlanServiceNode {
  bindings: PlanBindingNode | PlanBindingNode[] | undefined;
  isContextFree: boolean;
  readonly serviceIdentifier: ServiceIdentifier;
  resolve: (params: ResolutionParams) => unknown;
}
