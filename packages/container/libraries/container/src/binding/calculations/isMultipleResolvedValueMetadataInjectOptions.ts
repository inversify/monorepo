import {
  type MultipleResolvedValueMetadataInjectOptions,
  type ResolvedValueInjectOptions,
} from '../models/ResolvedValueInjectOptions.js';

export function isMultipleResolvedValueMetadataInjectOptions<T>(
  options: ResolvedValueInjectOptions<T>,
): options is ResolvedValueInjectOptions<T> &
  MultipleResolvedValueMetadataInjectOptions<T> {
  return (
    (options as Partial<MultipleResolvedValueMetadataInjectOptions<T>>)
      .isMultiple === true
  );
}
