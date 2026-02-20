import {
  type BindingScope,
  bindingScopeValues,
} from '../../binding/models/BindingScope.js';
import { type BindingType } from '../../binding/models/BindingType.js';
import { type ScopedBinding } from '../../binding/models/ScopedBinding.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved } from '../models/Resolved.js';
import { cacheResolvedValue } from './cacheResolvedValue.js';
import { resolveBindingActivations } from './resolveBindingActivations.js';

export function resolveScoped<
  TActivated,
  TArg,
  TType extends BindingType,
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  TBinding extends ScopedBinding<TType, BindingScope, TActivated>,
>(
  getBinding: (arg: TArg) => TBinding,
  resolve: (params: ResolutionParams, arg: TArg) => Resolved<TActivated>,
): (params: ResolutionParams, arg: TArg) => Resolved<TActivated> {
  return (params: ResolutionParams, arg: TArg): Resolved<TActivated> => {
    const binding: TBinding = getBinding(arg);

    switch (binding.scope) {
      case bindingScopeValues.Singleton: {
        if (binding.cache.isRight) {
          return binding.cache.value;
        }

        const resolvedValue: Resolved<TActivated> =
          resolveBindingActivations<TActivated>(
            params,
            binding,
            resolve(params, arg),
          );

        return cacheResolvedValue(binding, resolvedValue);
      }
      case bindingScopeValues.Request: {
        if (params.requestScopeCache.has(binding.id)) {
          return params.requestScopeCache.get(
            binding.id,
          ) as Resolved<TActivated>;
        }

        const resolvedValue: Resolved<TActivated> =
          resolveBindingActivations<TActivated>(
            params,
            binding,
            resolve(params, arg),
          );

        params.requestScopeCache.set(binding.id, resolvedValue);

        return resolvedValue;
      }
      case bindingScopeValues.Transient:
        return resolveBindingActivations<TActivated>(
          params,
          binding,
          resolve(params, arg),
        );
    }
  };
}
