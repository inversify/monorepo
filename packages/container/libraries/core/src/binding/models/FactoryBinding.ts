import { ResolutionContext } from '../../resolution/models/ResolutionContext';
import { bindingScopeValues } from './BindingScope';
import { bindingTypeValues } from './BindingType';
import { Factory } from './Factory';
import { ScopedBinding } from './ScopedBinding';

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
