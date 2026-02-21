import { type BindingConstraints, type MetadataTag } from '@inversifyjs/core';

import { isAnyAncestorBindingConstraints } from './isAnyAncestorBindingConstraints.js';
import { isBindingConstraintsWithTag } from './isBindingConstraintsWithTag.js';

export function isAnyAncestorBindingConstraintsWithTag(
  tag: MetadataTag,
  value: unknown,
): (constraints: BindingConstraints) => boolean {
  return isAnyAncestorBindingConstraints(
    isBindingConstraintsWithTag(tag, value),
  );
}
