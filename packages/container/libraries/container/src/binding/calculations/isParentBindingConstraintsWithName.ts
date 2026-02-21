import { type BindingConstraints, type MetadataName } from '@inversifyjs/core';

import { isBindingConstraintsWithName } from './isBindingConstraintsWithName.js';
import { isParentBindingConstraints } from './isParentBindingConstraints.js';

export function isParentBindingConstraintsWithName(
  name: MetadataName,
): (constraints: BindingConstraints) => boolean {
  return isParentBindingConstraints(isBindingConstraintsWithName(name));
}
