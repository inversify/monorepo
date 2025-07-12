import { ServiceIdentifier } from '@inversifyjs/common';

import { PlanBindingNode } from './PlanBindingNode';
import { PlanServiceNodeParent } from './PlanServiceNodeParent';

export interface PlanServiceNode {
  readonly chained: boolean;
  readonly bindings: PlanBindingNode | PlanBindingNode[] | undefined;
  readonly parent: PlanServiceNodeParent | undefined;
  readonly serviceIdentifier: ServiceIdentifier;
}
