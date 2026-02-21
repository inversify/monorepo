import { type BindingConstraints } from '@inversifyjs/core';

export function isParentBindingConstraints(
  condition: (constraints: BindingConstraints) => boolean,
): (constraints: BindingConstraints) => boolean {
  return (constraints: BindingConstraints): boolean => {
    const ancestorMetadata: BindingConstraints | undefined =
      constraints.getAncestor();

    return ancestorMetadata !== undefined && condition(ancestorMetadata);
  };
}
