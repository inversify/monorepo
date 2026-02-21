import { type BindingConstraints, type MetadataTag } from '@inversifyjs/core';

import { isBindingConstraintsWithTag } from './isBindingConstraintsWithTag.js';
import { isParentBindingConstraints } from './isParentBindingConstraints.js';

export function isParentBindingConstraintsWithTag(
  tag: MetadataTag,
  value: unknown,
): (constraints: BindingConstraints) => boolean {
  return isParentBindingConstraints(isBindingConstraintsWithTag(tag, value));
}
