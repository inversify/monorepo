import {
  type ErrorFilter,
  getCatchErrorMetadata,
  getErrorDiscriminatorMetadata,
} from '@inversifyjs/framework-core';
import { type Logger } from '@inversifyjs/logger';
import { type Newable } from 'inversify';

export function setErrorFilterToErrorFilterMap(
  logger: Logger,
  errorDiscriminatorToErrorFilterMap: Map<
    string | symbol,
    ErrorFilter | Newable<ErrorFilter>
  >,
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

    if (errorType !== null) {
      const discriminators: (string | symbol)[] | undefined =
        getErrorDiscriminatorMetadata(errorType);

      if (discriminators !== undefined) {
        for (const discriminator of discriminators) {
          if (!errorDiscriminatorToErrorFilterMap.has(discriminator)) {
            errorDiscriminatorToErrorFilterMap.set(discriminator, errorFilter);
          }
        }
      }
    }
  }
}
