import { type ResolvedValueMetadata } from '../../metadata/models/ResolvedValueMetadata.js';
import { type BindingScope } from './BindingScope.js';
import { type bindingTypeValues } from './BindingType.js';
import { type ScopedBinding } from './ScopedBinding.js';

export interface ResolvedValueBinding<TActivated> extends ScopedBinding<
  typeof bindingTypeValues.ResolvedValue,
  BindingScope,
  TActivated
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly factory: (...args: any[]) => TActivated | Promise<TActivated>;
  readonly metadata: ResolvedValueMetadata;
}
