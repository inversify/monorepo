import {
  ErrorFilter,
  getCatchErrorMetadata,
} from '@inversifyjs/framework-core';
import { Newable } from 'inversify';

export function setErrorFilterToErrorFilterMap(
  errorTypeToGlobalErrorFilterMap: Map<
    Newable<Error> | null,
    Newable<ErrorFilter>
  >,
  errorFilter: Newable<ErrorFilter>,
): void {
  const errorTypes: Set<Newable<Error> | null> =
    getCatchErrorMetadata(errorFilter);

  for (const errorType of errorTypes) {
    const existingErrorFilter: Newable<ErrorFilter> | undefined =
      errorTypeToGlobalErrorFilterMap.get(errorType);

    if (existingErrorFilter === undefined) {
      errorTypeToGlobalErrorFilterMap.set(errorType, errorFilter);
    }
  }
}
