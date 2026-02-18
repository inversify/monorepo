import { isPromise } from '@inversifyjs/common';

import { type BindingScope } from '../../binding/models/BindingScope.js';
import { type BindingType } from '../../binding/models/BindingType.js';
import { type ScopedBinding } from '../../binding/models/ScopedBinding.js';
import { type Resolved, type SyncResolved } from '../models/Resolved.js';

export function cacheResolvedValue<
  TActivated,
  TType extends BindingType,
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  TBinding extends ScopedBinding<TType, BindingScope, TActivated>,
>(
  binding: TBinding,
  resolvedValue: Resolved<TActivated>,
): Resolved<TActivated> {
  if (isPromise(resolvedValue)) {
    binding.cache = {
      isRight: true,
      value: resolvedValue,
    };

    return resolvedValue.then((syncResolvedValue: SyncResolved<TActivated>) =>
      cacheSyncResolvedValue(binding, syncResolvedValue),
    );
  }

  return cacheSyncResolvedValue(binding, resolvedValue);
}

function cacheSyncResolvedValue<
  TActivated,
  TType extends BindingType,
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  TBinding extends ScopedBinding<TType, BindingScope, TActivated>,
>(
  binding: TBinding,
  resolvedValue: SyncResolved<TActivated>,
): SyncResolved<TActivated> {
  binding.cache = {
    isRight: true,
    value: resolvedValue,
  };

  return resolvedValue;
}
