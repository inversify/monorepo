import { type BindingConstraints, type MetadataTag } from '@inversifyjs/core';

import { isBindingConstraintsWithTag } from './isBindingConstraintsWithTag.js';
import { isNoAncestorBindingConstraints } from './isNoAncestorBindingConstraints.js';

export function isNoAncestorBindingConstraintsWithTag(
  tag: MetadataTag,
  value: unknown,
): (constraints: BindingConstraints) => boolean {
  return isNoAncestorBindingConstraints(
    isBindingConstraintsWithTag(tag, value),
  );
}
