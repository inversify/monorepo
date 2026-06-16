import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type ClassMetadata } from '../../metadata/models/ClassMetadata.js';
import { type PlanServiceNode } from './PlanServiceNode.js';
import { type ResolvableBindingNode } from './ResolvableBindingNode.js';

export interface InstanceBindingNode<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TActivated = any,
  TBinding extends InstanceBinding<TActivated> = InstanceBinding<TActivated>,
> extends ResolvableBindingNode<TActivated, TBinding> {
  readonly classMetadata: ClassMetadata;
  readonly constructorParams: (PlanServiceNode | undefined)[];
  readonly propertyParams: Map<string | symbol, PlanServiceNode>;
}
