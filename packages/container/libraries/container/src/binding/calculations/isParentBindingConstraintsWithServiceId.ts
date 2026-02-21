import { type ServiceIdentifier } from '@inversifyjs/common';
import { type BindingConstraints } from '@inversifyjs/core';

import { isBindingConstraintsWithServiceId } from './isBindingConstraintsWithServiceId.js';
import { isParentBindingConstraints } from './isParentBindingConstraints.js';

export function isParentBindingConstraintsWithServiceId(
  serviceId: ServiceIdentifier,
): (constraints: BindingConstraints) => boolean {
  return isParentBindingConstraints(
    isBindingConstraintsWithServiceId(serviceId),
  );
}
