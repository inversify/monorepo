import { type bindingScopeValues } from '../../binding/models/BindingScope.js';
import { type BindingType } from '../../binding/models/BindingType.js';
import { type ScopedBinding } from '../../binding/models/ScopedBinding.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved } from '../models/Resolved.js';
import { cacheResolvedValue } from './cacheResolvedValue.js';
import { resolveBindingActivations } from './resolveBindingActivations.js';

export function resolveSingletonScopedBinding<
  TActivated,
  TType extends BindingType,
  TBinding extends ScopedBinding<
    TType,
    typeof bindingScopeValues.Singleton,
    TActivated
  >,
>(
  resolve: (
    params: ResolutionParams,
    binding: TBinding,
  ) => Resolved<TActivated>,
): (params: ResolutionParams, binding: TBinding) => Resolved<TActivated> {
  return (
    params: ResolutionParams,
    binding: TBinding,
  ): Resolved<TActivated> => {
    if (binding.cache.isRight) {
      return binding.cache.value;
    }

    const resolvedValue: Resolved<TActivated> = resolveBindingActivations(
      params,
      binding,
      resolve(params, binding),
    );

    return cacheResolvedValue(binding, resolvedValue);
  };
}
