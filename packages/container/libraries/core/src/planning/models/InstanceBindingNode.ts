import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type ClassMetadata } from '../../metadata/models/ClassMetadata.js';
import { type BaseBindingNode } from './BaseBindingNode.js';
import { type PlanServiceNode } from './PlanServiceNode.js';

export interface InstanceBindingNode<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TBinding extends InstanceBinding<any> = InstanceBinding<any>,
> extends BaseBindingNode<TBinding> {
  readonly classMetadata: ClassMetadata;
  readonly constructorParams: (PlanServiceNode | undefined)[];
  readonly propertyParams: Map<string | symbol, PlanServiceNode>;
}
