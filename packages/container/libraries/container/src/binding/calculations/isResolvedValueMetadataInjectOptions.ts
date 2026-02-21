import { LazyServiceIdentifier } from '@inversifyjs/common';

import {
  type ResolvedValueInjectOptions,
  type ResolvedValueMetadataInjectOptions,
} from '../models/ResolvedValueInjectOptions.js';

export function isResolvedValueMetadataInjectOptions<T>(
  options: ResolvedValueInjectOptions<T>,
): options is ResolvedValueMetadataInjectOptions<T> {
  return typeof options === 'object' && !LazyServiceIdentifier.is(options);
}
