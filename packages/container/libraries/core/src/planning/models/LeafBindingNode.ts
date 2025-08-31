import { ConstantValueBinding } from '../../binding/models/ConstantValueBinding';
import { DynamicValueBinding } from '../../binding/models/DynamicValueBinding';
import { Factory } from '../../binding/models/Factory';
import { FactoryBinding } from '../../binding/models/FactoryBinding';
import { Provider } from '../../binding/models/Provider';
import { ProviderBinding } from '../../binding/models/ProviderBinding';
import { BaseBindingNode } from './BaseBindingNode';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LeafBindingNode<TActivated = any> = BaseBindingNode<
  | ConstantValueBinding<TActivated>
  | DynamicValueBinding<TActivated>
  | (TActivated extends Factory<unknown> ? FactoryBinding<TActivated> : never)
  | (TActivated extends Provider<unknown> ? ProviderBinding<TActivated> : never) // eslint-disable-line @typescript-eslint/no-deprecated
>;
