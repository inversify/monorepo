import { type BindingConstraints, type MetadataName } from '@inversifyjs/core';

import { isBindingConstraintsWithName } from './isBindingConstraintsWithName.js';
import { isNotParentBindingConstraints } from './isNotParentBindingConstraints.js';

export function isNotParentBindingConstraintsWithName(
  name: MetadataName,
): (constraints: BindingConstraints) => boolean {
  return isNotParentBindingConstraints(isBindingConstraintsWithName(name));
}
