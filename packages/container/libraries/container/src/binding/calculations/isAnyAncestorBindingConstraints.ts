import { type BindingConstraints } from '@inversifyjs/core';

export function isAnyAncestorBindingConstraints(
  condition: (constraints: BindingConstraints) => boolean,
): (constraints: BindingConstraints) => boolean {
  return (constraints: BindingConstraints): boolean => {
    for (
      let ancestorMetadata: BindingConstraints | undefined =
        constraints.getAncestor();
      ancestorMetadata !== undefined;
      ancestorMetadata = ancestorMetadata.getAncestor()
    ) {
      if (condition(ancestorMetadata)) {
        return true;
      }
    }

    return false;
  };
}
