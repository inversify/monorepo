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
  const bindingCache: Right<Resolved<TResolved>> = binding.cache;

  if (isPromise(bindingCache.value)) {
    return bindingCache.value.then(
      (resolvedValue: TResolved): void | Promise<void> =>
        resolveBindingDeactivationsFromValue(params, binding, resolvedValue),
    );
  }

  return resolveBindingDeactivationsFromValue(
    params,
    binding,
    bindingCache.value,
  );
}

function resolveBindingDeactivationsFromValue<TResolved>(
  params: DeactivationParams,
  binding: CachedSingletonScopedBinding<TResolved>,
  resolvedValue: TResolved,
): void | Promise<void> {
  const serviceDeactivationResult: void | Promise<void> =
    resolveBindingServiceDeactivations(
      params,
      binding.serviceIdentifier,
      resolvedValue,
    );

  if (isPromise(serviceDeactivationResult)) {
    return serviceDeactivationResult.then((): void | Promise<void> =>
      resolveBindingOnDeactivationThenPreDestroy(
        params,
        binding,
        resolvedValue,
      ),
    );
  }

  return resolveBindingOnDeactivationThenPreDestroy(
    params,
    binding,
    resolvedValue,
  );
}

function resolveBindingOnDeactivationThenPreDestroy<TResolved>(
  params: DeactivationParams,
  binding: CachedSingletonScopedBinding<TResolved>,
  resolvedValue: TResolved,
): void | Promise<void> {
  if (binding.onDeactivation !== undefined) {
    const bindingDeactivation: BindingDeactivation<TResolved> =
      binding.onDeactivation;
    const deactivationResult: void | Promise<void> =
      bindingDeactivation(resolvedValue);

    if (isPromise(deactivationResult)) {
      return deactivationResult.then((): void | Promise<void> =>
        resolveBindingPreDestroy(params, binding),
      );
    }
  }

  return resolveBindingPreDestroy(params, binding);
}
