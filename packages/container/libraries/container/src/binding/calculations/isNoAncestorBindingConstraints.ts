import { type BindingConstraints } from '@inversifyjs/core';

import { isAnyAncestorBindingConstraints } from './isAnyAncestorBindingConstraints.js';

export function isNoAncestorBindingConstraints(
  condition: (constraints: BindingConstraints) => boolean,
): (constraints: BindingConstraints) => boolean {
  const isAnyAncestorBindingConstraintsConstraint: (
    constraints: BindingConstraints,
  ) => boolean = isAnyAncestorBindingConstraints(condition);

  return (constraints: BindingConstraints): boolean => {
    return !isAnyAncestorBindingConstraintsConstraint(constraints);
  };
}
