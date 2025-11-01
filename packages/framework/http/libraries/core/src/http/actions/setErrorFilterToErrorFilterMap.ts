import {
  ErrorFilter,
  getCatchErrorMetadata,
} from '@inversifyjs/framework-core';
import { Logger } from '@inversifyjs/logger';
import { Newable } from 'inversify';

export function setErrorFilterToErrorFilterMap(
  logger: Logger,
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
    } else {
      const errorTypeName: string =
        errorType === null ? 'null (catch-all)' : errorType.name;
      logger.warn(
        `Error filter '${errorFilter.name}' was not registered for error type '${errorTypeName}' because an error filter is already registered for this error type.`,
      );
    }
  }
}
