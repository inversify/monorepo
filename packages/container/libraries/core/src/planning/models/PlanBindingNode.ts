import { type LeafBindingNode } from './LeafBindingNode.js';
import { type PlanServiceNodeParent } from './PlanServiceNodeParent.js';
import { type PlanServiceRedirectionBindingNode } from './PlanServiceRedirectionBindingNode.js';

export type PlanBindingNode =
  | PlanServiceNodeParent
  | PlanServiceRedirectionBindingNode
  | LeafBindingNode;
