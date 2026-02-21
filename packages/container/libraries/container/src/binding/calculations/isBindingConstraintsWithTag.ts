import { type BindingConstraints, type MetadataTag } from '@inversifyjs/core';

export function isBindingConstraintsWithTag(
  tag: MetadataTag,
  value: unknown,
): (constraints: BindingConstraints) => boolean {
  return (constraints: BindingConstraints): boolean =>
    constraints.tags.has(tag) && constraints.tags.get(tag) === value;
}
