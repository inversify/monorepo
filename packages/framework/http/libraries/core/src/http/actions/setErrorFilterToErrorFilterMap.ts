import {
  type ErrorFilter,
  getCatchErrorMetadata,
  getErrorDiscriminatorMetadata,
} from '@inversifyjs/framework-core';
import { type Logger } from '@inversifyjs/logger';
import { type Newable } from 'inversify';

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
    const keysToRegister: (Newable<Error> | string | symbol | null)[] = [
      errorType,
    ];

    if (errorType !== null) {
      const discriminators: (string | symbol)[] | undefined =
        getErrorDiscriminatorMetadata(errorType);

      if (discriminators !== undefined) {
        for (const discriminator of discriminators) {
          if (!keysToRegister.includes(discriminator)) {
            keysToRegister.push(discriminator);
          }
        }
      }
    }

    const errorTypeToFilterMap: Map<
      unknown,
      ErrorFilter | Newable<ErrorFilter>
    > = errorTypeToErrorFilterMap;

    for (const key of keysToRegister) {
      const existingErrorFilter:
        ErrorFilter | Newable<ErrorFilter> | undefined =
        errorTypeToFilterMap.get(key);

      if (existingErrorFilter === undefined) {
        errorTypeToFilterMap.set(key, errorFilter);
      } else if (key === errorType) {
        const errorTypeName: string =
          errorType === null ? 'null (catch-all)' : errorType.name;

        logger.warn(
          `Error filter '${errorFilter.name}' was not registered for error type '${errorTypeName}' because an error filter is already registered for this error type.`,
        );
      }
    }
  }
}
