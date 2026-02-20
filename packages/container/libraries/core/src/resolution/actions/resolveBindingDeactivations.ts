import { isPromise, type Right } from '@inversifyjs/common';

import { type Binding } from '../../binding/models/Binding.js';
import { type BindingDeactivation } from '../../binding/models/BindingDeactivation.js';
import { type bindingScopeValues } from '../../binding/models/BindingScope.js';
import { type BindingType } from '../../binding/models/BindingType.js';
import { type ScopedBinding } from '../../binding/models/ScopedBinding.js';
import { type DeactivationParams } from '../models/DeactivationParams.js';
import { type Resolved } from '../models/Resolved.js';
import { resolveBindingPreDestroy } from './resolveBindingPreDestroy.js';
import { resolveBindingServiceDeactivations } from './resolveBindingServiceDeactivations.js';

const CACHE_KEY_TYPE: keyof ScopedBinding<
  BindingType,
  typeof bindingScopeValues.Singleton,
  unknown
> = 'cache';

type CachedSingletonScopedBinding<TResolved> = Binding &
  ScopedBinding<BindingType, typeof bindingScopeValues.Singleton, TResolved> & {
    [CACHE_KEY_TYPE]: Right<Resolved<TResolved>>;
  };

export function resolveBindingDeactivations<TResolved>(
  params: DeactivationParams,
  binding: CachedSingletonScopedBinding<TResolved>,
): void | Promise<void> {
  const preDestroyResult: void | Promise<void> = resolveBindingPreDestroy(
    params,
    binding,
  );

  if (preDestroyResult === undefined) {
    return resolveBindingDeactivationsAfterPreDestroy(params, binding);
  }

  return preDestroyResult.then((): void | Promise<void> =>
    resolveBindingDeactivationsAfterPreDestroy(params, binding),
  );
}

function resolveBindingDeactivationsAfterPreDestroy<TResolved>(
  params: DeactivationParams,
  binding: CachedSingletonScopedBinding<TResolved>,
): void | Promise<void> {
  const bindingCache: Right<Resolved<TResolved>> = binding.cache;

  if (isPromise(bindingCache.value)) {
    return bindingCache.value.then(
      (resolvedValue: TResolved): void | Promise<void> =>
        resolveBindingDeactivationsAfterPreDestroyFromValue(
          params,
          binding,
          resolvedValue,
        ),
    );
  }

  return resolveBindingDeactivationsAfterPreDestroyFromValue(
    params,
    binding,
    bindingCache.value,
  );
}

function resolveBindingDeactivationsAfterPreDestroyFromValue<TResolved>(
  params: DeactivationParams,
  binding: CachedSingletonScopedBinding<TResolved>,
  resolvedValue: TResolved,
): void | Promise<void> {
  let deactivationResult: void | Promise<void> = undefined;

  if (binding.onDeactivation !== undefined) {
    const bindingDeactivation: BindingDeactivation<TResolved> =
      binding.onDeactivation;

    deactivationResult = bindingDeactivation(resolvedValue);
  }

  if (deactivationResult === undefined) {
    return resolveBindingServiceDeactivations(
      params,
      binding.serviceIdentifier,
      resolvedValue,
    );
  } else {
    return deactivationResult.then((): void | Promise<void> =>
      resolveBindingServiceDeactivations(
        params,
        binding.serviceIdentifier,
        resolvedValue,
      ),
    );
  }
}
