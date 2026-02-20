import { type Right } from '@inversifyjs/common';

import { isScopedBinding } from '../../binding/calculations/isScopedBinding.js';
import { type Binding } from '../../binding/models/Binding.js';
import { bindingScopeValues } from '../../binding/models/BindingScope.js';
import { type BindingType } from '../../binding/models/BindingType.js';
import { type ScopedBinding } from '../../binding/models/ScopedBinding.js';
import { type DeactivationParams } from '../models/DeactivationParams.js';
import { type Resolved } from '../models/Resolved.js';
import { resolveBindingDeactivations } from './resolveBindingDeactivations.js';

const CACHE_KEY_TYPE: keyof ScopedBinding<
  BindingType,
  typeof bindingScopeValues.Singleton,
  unknown
> = 'cache';

type CachedSingletonScopedBinding<TResolved> = Binding &
  ScopedBinding<BindingType, typeof bindingScopeValues.Singleton, TResolved> & {
    [CACHE_KEY_TYPE]: Right<Resolved<TResolved>>;
  };

export function resolveBindingsDeactivations(
  params: DeactivationParams,
  bindings: Iterable<Binding> | undefined,
): void | Promise<void> {
  if (bindings === undefined) {
    return;
  }

  const singletonScopedBindings: CachedSingletonScopedBinding<unknown>[] =
    filterCachedSinglentonScopedBindings(bindings);

  const deactivationPromiseResults: Promise<void>[] = [];

  for (const binding of singletonScopedBindings) {
    const deactivationResult: void | Promise<void> =
      resolveBindingDeactivations(params, binding);

    if (deactivationResult !== undefined) {
      deactivationPromiseResults.push(deactivationResult);
    }
  }

  if (deactivationPromiseResults.length > 0) {
    return Promise.all(deactivationPromiseResults).then(() => undefined);
  }
}

function filterCachedSinglentonScopedBindings(
  bindings: Iterable<Binding>,
): CachedSingletonScopedBinding<unknown>[] {
  const filteredBindings: CachedSingletonScopedBinding<unknown>[] = [];

  for (const binding of bindings) {
    if (
      isScopedBinding(binding) &&
      binding.scope === bindingScopeValues.Singleton &&
      binding.cache.isRight
    ) {
      filteredBindings.push(binding as CachedSingletonScopedBinding<unknown>);
    }
  }

  return filteredBindings;
}
