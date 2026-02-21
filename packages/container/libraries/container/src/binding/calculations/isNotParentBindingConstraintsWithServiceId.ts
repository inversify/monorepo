import { type ServiceIdentifier } from '@inversifyjs/common';
import { type BindingConstraints } from '@inversifyjs/core';

import { isBindingConstraintsWithServiceId } from './isBindingConstraintsWithServiceId.js';
import { isNotParentBindingConstraints } from './isNotParentBindingConstraints.js';

export function isNotParentBindingConstraintsWithServiceId(
  serviceId: ServiceIdentifier,
): (constraints: BindingConstraints) => boolean {
  return isNotParentBindingConstraints(
    isBindingConstraintsWithServiceId(serviceId),
  );
}
