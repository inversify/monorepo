import {
  type ErrorFilter,
  getErrorDiscriminatorMetadata,
} from '@inversifyjs/framework-core';
import { type Newable } from 'inversify';

export function getErrorFilterFromDiscriminatorMaps(
  errorType: Newable,
  errorDiscriminatorToFilterMapList: Map<
    string | symbol,
    ErrorFilter | Newable<ErrorFilter>
  >[],
): ErrorFilter | Newable<ErrorFilter> | undefined {
  const discriminators: (string | symbol)[] | undefined =
    getErrorDiscriminatorMetadata(errorType);

  if (discriminators === undefined) {
    return undefined;
  }

  for (const discriminator of discriminators) {
    for (const errorDiscriminatorToFilterMap of errorDiscriminatorToFilterMapList) {
      const errorFilterOrType: ErrorFilter | Newable<ErrorFilter> | undefined =
        errorDiscriminatorToFilterMap.get(discriminator);

      if (errorFilterOrType !== undefined) {
        return errorFilterOrType;
      }
    }
  }

  return undefined;
}
