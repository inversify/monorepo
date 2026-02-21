import { type BindingConstraints, type MetadataName } from '@inversifyjs/core';

import { isBindingConstraintsWithName } from './isBindingConstraintsWithName.js';
import { isNoAncestorBindingConstraints } from './isNoAncestorBindingConstraints.js';

export function isNoAncestorBindingConstraintsWithName(
  name: MetadataName,
): (constraints: BindingConstraints) => boolean {
  return isNoAncestorBindingConstraints(isBindingConstraintsWithName(name));
}
