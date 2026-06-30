import { type BasePlanParams } from './BasePlanParams.js';
import { type BuildServiceNodeOptions } from './BuildServiceNodeOptions.js';
import { type InstanceBindingNode } from './InstanceBindingNode.js';
import { type PlanServiceNodeParent } from './PlanServiceNodeParent.js';
import { type PlanServiceRedirectionBindingNode } from './PlanServiceRedirectionBindingNode.js';
import { type ResolvedValueBindingNode } from './ResolvedValueBindingNode.js';

export type SubplanParams =
  | InstanceSubplanParams
  | RedirectionSubplanParams
  | ResolvedValueSubplanParams;

interface BaseSubplanParams<
  TNode extends PlanServiceNodeParent,
> extends BasePlanParams {
  node: TNode;
}

export type InstanceSubplanParams = BaseSubplanParams<InstanceBindingNode>;
export interface RedirectionSubplanParams extends BaseSubplanParams<PlanServiceRedirectionBindingNode> {
  buildServiceNodeOptions: BuildServiceNodeOptions;
}

export type ResolvedValueSubplanParams =
  BaseSubplanParams<ResolvedValueBindingNode>;
