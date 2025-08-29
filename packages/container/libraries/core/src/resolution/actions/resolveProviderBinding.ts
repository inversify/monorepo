import { bindingTypeValues } from '../../binding/models/BindingType';
import { Provider } from '../../binding/models/Provider';
import { ProviderBinding } from '../../binding/models/ProviderBinding';
import { resolveProviderBindingCallback } from '../calculations/resolveProviderBindingCallback';
import { ResolutionParams } from '../models/ResolutionParams';
import { Resolved } from '../models/Resolved';
import { resolveSingletonScopedBinding } from './resolveSingletonScopedBinding';

export const resolveProviderBinding: <TActivated extends Provider<unknown>>( // eslint-disable-line @typescript-eslint/no-deprecated
  params: ResolutionParams,
  binding: ProviderBinding<TActivated>,
) => Resolved<TActivated> = resolveSingletonScopedBinding<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  typeof bindingTypeValues.Provider,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ProviderBinding<any>
>(resolveProviderBindingCallback);
