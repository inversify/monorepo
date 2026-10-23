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

    if (
      existingErrorFilter !== undefined &&
      existingErrorFilter !== errorFilter
    ) {
      const errorTypeName: string =
        errorType === null ? 'null (catch-all)' : errorType.name;

      logger.warn(
        `Error filter '${errorFilter.name}' overrides the error filter already registered for error type '${errorTypeName}'.`,
      );
    }

    errorTypeToErrorFilterMap.set(errorType, errorFilter);

    if (errorType !== null) {
      const discriminators: (string | symbol)[] | undefined =
        getErrorDiscriminatorMetadata(errorType);

      if (discriminators !== undefined) {
        for (const discriminator of discriminators) {
          errorDiscriminatorToErrorFilterMap.set(discriminator, errorFilter);
        }
      }
    }
  }
}
