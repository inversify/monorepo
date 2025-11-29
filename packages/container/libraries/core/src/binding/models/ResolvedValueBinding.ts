import { ResolvedValueMetadata } from '../../metadata/models/ResolvedValueMetadata';
import { BindingScope } from './BindingScope';
import { bindingTypeValues } from './BindingType';
import { ScopedBinding } from './ScopedBinding';

export interface ResolvedValueBinding<TActivated> extends ScopedBinding<
  typeof bindingTypeValues.ResolvedValue,
  BindingScope,
  TActivated
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly factory: (...args: any[]) => TActivated | Promise<TActivated>;
  readonly metadata: ResolvedValueMetadata;
}
