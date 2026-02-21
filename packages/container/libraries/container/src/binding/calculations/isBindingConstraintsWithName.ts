import { type BindingConstraints, type MetadataName } from '@inversifyjs/core';

export function isBindingConstraintsWithName(
  name: MetadataName,
): (constraints: BindingConstraints) => boolean {
  return (constraints: BindingConstraints): boolean =>
    constraints.name === name;
}
