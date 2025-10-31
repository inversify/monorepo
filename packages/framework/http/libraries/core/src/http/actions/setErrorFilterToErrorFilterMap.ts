import {
  ErrorFilter,
  getCatchErrorMetadata,
} from '@inversifyjs/framework-core';
import { Newable } from 'inversify';

export function setErrorFilterToErrorFilterMap(
  errorTypeToErrorFilterMap: Map<
    Newable<Error> | null,
    ErrorFilter | Newable<ErrorFilter>
  >,
  errorFilter: Newable<ErrorFilter>,
): void {
  const errorTypes: Set<Newable<Error> | null> =
    getCatchErrorMetadata(errorFilter);

  for (const errorType of errorTypes) {
    const existingErrorFilter: ErrorFilter | Newable<ErrorFilter> | undefined =
      errorTypeToErrorFilterMap.get(errorType);

    if (existingErrorFilter === undefined) {
      errorTypeToErrorFilterMap.set(errorType, errorFilter);
    }
  }
}
