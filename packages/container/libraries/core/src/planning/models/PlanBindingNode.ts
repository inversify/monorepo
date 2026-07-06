import { type FactoryBindingNode } from './FactoryBindingNode.js';
import { type LeafBindingNode } from './LeafBindingNode.js';
import { type PlanServiceNodeParent } from './PlanServiceNodeParent.js';

export type PlanBindingNode =
  PlanServiceNodeParent | LeafBindingNode | FactoryBindingNode;
