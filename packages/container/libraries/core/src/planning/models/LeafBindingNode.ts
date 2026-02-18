import { type ConstantValueBinding } from '../../binding/models/ConstantValueBinding.js';
import { type DynamicValueBinding } from '../../binding/models/DynamicValueBinding.js';
import { type Factory } from '../../binding/models/Factory.js';
import { type FactoryBinding } from '../../binding/models/FactoryBinding.js';
import { type BaseBindingNode } from './BaseBindingNode.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LeafBindingNode<TActivated = any> = BaseBindingNode<
  | ConstantValueBinding<TActivated>
  | DynamicValueBinding<TActivated>
  | (TActivated extends Factory<unknown> ? FactoryBinding<TActivated> : never)
>;
