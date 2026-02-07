import { ConstantValueBinding } from './ConstantValueBinding';
import { DynamicValueBinding } from './DynamicValueBinding';
import { Factory } from './Factory';
import { FactoryBinding } from './FactoryBinding';
import { InstanceBinding } from './InstanceBinding';
import { ResolvedValueBinding } from './ResolvedValueBinding';
import { ServiceRedirectionBinding } from './ServiceRedirectionBinding';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Binding<TActivated = any> =
  | ConstantValueBinding<TActivated>
  | DynamicValueBinding<TActivated>
  | (TActivated extends Factory<unknown> ? FactoryBinding<TActivated> : never)
  | InstanceBinding<TActivated>
  | ResolvedValueBinding<TActivated>
  | ServiceRedirectionBinding<TActivated>;
