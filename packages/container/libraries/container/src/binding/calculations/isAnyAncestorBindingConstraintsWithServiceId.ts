import { type ServiceIdentifier } from '@inversifyjs/common';
import { type BindingConstraints } from '@inversifyjs/core';

import { isAnyAncestorBindingConstraints } from './isAnyAncestorBindingConstraints.js';
import { isBindingConstraintsWithServiceId } from './isBindingConstraintsWithServiceId.js';

export function isAnyAncestorBindingConstraintsWithServiceId(
  serviceId: ServiceIdentifier,
): (constraints: BindingConstraints) => boolean {
  return isAnyAncestorBindingConstraints(
    isBindingConstraintsWithServiceId(serviceId),
  );
}
