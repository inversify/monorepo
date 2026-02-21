import { type BindingConstraints, type MetadataName } from '@inversifyjs/core';

import { isAnyAncestorBindingConstraints } from './isAnyAncestorBindingConstraints.js';
import { isBindingConstraintsWithName } from './isBindingConstraintsWithName.js';

export function isAnyAncestorBindingConstraintsWithName(
  name: MetadataName,
): (constraints: BindingConstraints) => boolean {
  return isAnyAncestorBindingConstraints(isBindingConstraintsWithName(name));
}
