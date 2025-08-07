import { PlanBindingNode } from '../../planning/models/PlanBindingNode';

export interface PlanServiceNodeBindingRemovedResult {
  bindingNodeRemoved: PlanBindingNode | undefined;
  isContextFreeBinding: boolean;
}
