import { type ServiceIdentifier } from '@inversifyjs/common';

import { type PlanBindingNode } from './PlanBindingNode.js';

export interface PlanServiceNode {
  bindings: PlanBindingNode | PlanBindingNode[] | undefined;
  isContextFree: boolean;
  readonly serviceIdentifier: ServiceIdentifier;
}
