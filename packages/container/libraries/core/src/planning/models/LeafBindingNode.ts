import { type ConstantValueBinding } from '../../binding/models/ConstantValueBinding.js';
import { type DynamicValueBinding } from '../../binding/models/DynamicValueBinding.js';
import { type Factory } from '../../binding/models/Factory.js';
import { type FactoryBinding } from '../../binding/models/FactoryBinding.js';
import { type ResolvableBindingNode } from './ResolvableBindingNode.js';

type LeafBinding<TActivated> =
  | ConstantValueBinding<TActivated>
  | DynamicValueBinding<TActivated>
  | (TActivated extends Factory<unknown> ? FactoryBinding<TActivated> : never);

export type LeafBindingNode<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TActivated = any,
  TBinding extends LeafBinding<TActivated> = LeafBinding<TActivated>,
> = ResolvableBindingNode<TActivated, TBinding>;
