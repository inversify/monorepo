import {
  type ServiceIdentifier,
  stringifyServiceIdentifier,
} from '@inversifyjs/common';

import { isStackOverflowError } from '../../error/calculations/isStackOverflowError.js';
import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { type PlanParams } from '../models/PlanParams.js';

/**
 * Extracts a likely circular dependency asuming a service asociated to a
 * service identifier should not be asociated to services asociated to the same
 * service identifier.
 *
 * Important note: given the current binding constraints, there's no way to know
 * which is exactly the circular dependency. Custom ancestor based constraints might
 * allow circular dependencies breaking the loop when a certain condition is met.
 *
 * @param params plan params
 */
function extractLikelyCircularDependency(
  params: PlanParams,
): ServiceIdentifier[] {
  const serviceIdentifiers: Set<ServiceIdentifier> = new Set();

  for (const serviceIdentifier of params.servicesBranch) {
    if (serviceIdentifiers.has(serviceIdentifier)) {
      return [...serviceIdentifiers, serviceIdentifier];
    }

    serviceIdentifiers.add(serviceIdentifier);
  }

  return [...serviceIdentifiers];
}

export function handlePlanError(params: PlanParams, error: unknown): never {
  if (isStackOverflowError(error)) {
    const stringifiedCircularDependencies: string =
      stringifyServiceIdentifierTrace(extractLikelyCircularDependency(params));

    throw new InversifyCoreError(
      InversifyCoreErrorKind.planning,
      `Circular dependency found: ${stringifiedCircularDependencies}`,
      { cause: error },
    );
  }

  throw error;
}

function stringifyServiceIdentifierTrace(
  serviceIdentifiers: Iterable<ServiceIdentifier>,
): string {
  const serviceIdentifiersArray: ServiceIdentifier[] = [...serviceIdentifiers];

  if (serviceIdentifiersArray.length === 0) {
    return '(No dependency trace)';
  }

  return serviceIdentifiersArray.map(stringifyServiceIdentifier).join(' -> ');
}
