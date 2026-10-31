import { type PlanServiceNode } from './PlanServiceNode.js';
import { type PlanServiceRedirectionBindingNode } from './PlanServiceRedirectionBindingNode.js';

export type BindingNodeParent =
  | PlanServiceNode
  | PlanServiceRedirectionBindingNode;
