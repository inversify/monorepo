import { type PlanBindingNode } from '../../planning/models/PlanBindingNode.js';

export interface PlanServiceNodeBindingRemovedResult {
  bindingNodeRemoved: PlanBindingNode | undefined;
  isContextFreeBinding: boolean;
}
