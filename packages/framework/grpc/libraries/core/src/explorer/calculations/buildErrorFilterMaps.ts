import {
  type ErrorFilter,
  getClassErrorFilterMetadata,
  getClassMethodErrorFilterMetadata,
} from '@inversifyjs/framework-core';
import { type Logger } from '@inversifyjs/logger';
import { type Newable } from 'inversify';

import { setErrorFilterToErrorFilterMap } from '../../errorFilter/actions/setErrorFilterToErrorFilterMap.js';

export interface ErrorFilterMaps {
  errorDiscriminatorToErrorFilterMap: Map<
    string | symbol,
    ErrorFilter | Newable<ErrorFilter>
  >;
  errorTypeToErrorFilterMap: Map<
    Newable<Error> | null,
    ErrorFilter | Newable<ErrorFilter>
  >;
}

export function buildErrorFilterMaps(
  logger: Logger,
  target: NewableFunction,
  methodKey: string | symbol,
): ErrorFilterMaps {
  const errorDiscriminatorToErrorFilterMap: Map<
    string | symbol,
    ErrorFilter | Newable<ErrorFilter>
  > = new Map();
  const classErrorTypeToErrorFilterMap: Map<
    Newable<Error> | null,
    ErrorFilter | Newable<ErrorFilter>
  > = new Map();

  for (const errorFilter of getClassErrorFilterMetadata(target)) {
    setErrorFilterToErrorFilterMap(
      logger,
      errorDiscriminatorToErrorFilterMap,
      classErrorTypeToErrorFilterMap,
      errorFilter,
    );
  }

  const methodErrorTypeToErrorFilterMap: Map<
    Newable<Error> | null,
    ErrorFilter | Newable<ErrorFilter>
  > = new Map();

  for (const errorFilter of getClassMethodErrorFilterMetadata(
    target,
    methodKey,
  )) {
    setErrorFilterToErrorFilterMap(
      logger,
      errorDiscriminatorToErrorFilterMap,
      methodErrorTypeToErrorFilterMap,
      errorFilter,
    );
  }

  /*
   * Class and method filters are registered in separate maps so only
   * conflicts within the same level are warned about. Method filters override
   * class filters, both in the discriminator map (registered last) and here.
   */
  return {
    errorDiscriminatorToErrorFilterMap,
    errorTypeToErrorFilterMap: new Map([
      ...classErrorTypeToErrorFilterMap,
      ...methodErrorTypeToErrorFilterMap,
    ]),
  };
}
