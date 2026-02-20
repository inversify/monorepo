import { type Either } from '@inversifyjs/common';

import { type Resolved } from '../../resolution/models/Resolved.js';

export function cloneBindingCache<TActivated>(
  cache: Either<undefined, Resolved<TActivated>>,
): Either<undefined, Resolved<TActivated>> {
  if (cache.isRight) {
    return {
      isRight: true,
      value: cache.value,
    };
  }

  // A left cache is not cloned, just returned
  return cache;
}
