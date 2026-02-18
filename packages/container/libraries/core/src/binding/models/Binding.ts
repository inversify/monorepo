import { type ConstantValueBinding } from './ConstantValueBinding.js';
import { type DynamicValueBinding } from './DynamicValueBinding.js';
import { type Factory } from './Factory.js';
import { type FactoryBinding } from './FactoryBinding.js';
import { type InstanceBinding } from './InstanceBinding.js';
import { type ResolvedValueBinding } from './ResolvedValueBinding.js';
import { type ServiceRedirectionBinding } from './ServiceRedirectionBinding.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Binding<TActivated = any> =
  | ConstantValueBinding<TActivated>
  | DynamicValueBinding<TActivated>
  | (TActivated extends Factory<unknown> ? FactoryBinding<TActivated> : never)
  | InstanceBinding<TActivated>
  | ResolvedValueBinding<TActivated>
  | ServiceRedirectionBinding<TActivated>;
