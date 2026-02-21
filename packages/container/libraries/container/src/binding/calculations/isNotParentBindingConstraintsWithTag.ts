import { type BindingConstraints, type MetadataTag } from '@inversifyjs/core';

import { isBindingConstraintsWithTag } from './isBindingConstraintsWithTag.js';
import { isNotParentBindingConstraints } from './isNotParentBindingConstraints.js';

export function isNotParentBindingConstraintsWithTag(
  tag: MetadataTag,
  value: unknown,
): (constraints: BindingConstraints) => boolean {
  return isNotParentBindingConstraints(isBindingConstraintsWithTag(tag, value));
}
