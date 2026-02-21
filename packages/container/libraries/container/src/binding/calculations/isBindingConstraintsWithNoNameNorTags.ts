import { type BindingConstraints } from '@inversifyjs/core';

export function isBindingConstraintsWithNoNameNorTags(
  constraints: BindingConstraints,
): boolean {
  return constraints.name === undefined && constraints.tags.size === 0;
}
