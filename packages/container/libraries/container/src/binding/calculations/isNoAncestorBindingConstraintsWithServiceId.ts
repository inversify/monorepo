import { type ServiceIdentifier } from '@inversifyjs/common';
import { type BindingConstraints } from '@inversifyjs/core';

import { isBindingConstraintsWithServiceId } from './isBindingConstraintsWithServiceId.js';
import { isNoAncestorBindingConstraints } from './isNoAncestorBindingConstraints.js';

export function isNoAncestorBindingConstraintsWithServiceId(
  serviceId: ServiceIdentifier,
): (constraints: BindingConstraints) => boolean {
  return isNoAncestorBindingConstraints(
    isBindingConstraintsWithServiceId(serviceId),
  );
}
