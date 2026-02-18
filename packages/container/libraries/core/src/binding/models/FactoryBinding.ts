import { type ResolutionContext } from '../../resolution/models/ResolutionContext.js';
import { type bindingScopeValues } from './BindingScope.js';
import { type bindingTypeValues } from './BindingType.js';
import { type Factory } from './Factory.js';
import { type ScopedBinding } from './ScopedBinding.js';

export interface FactoryBinding<
  TActivated extends Factory<unknown>,
> extends ScopedBinding<
  typeof bindingTypeValues.Factory,
  typeof bindingScopeValues.Singleton,
  TActivated
> {
  readonly factory: (
    context: ResolutionContext,
  ) => TActivated | Promise<TActivated>;
}
