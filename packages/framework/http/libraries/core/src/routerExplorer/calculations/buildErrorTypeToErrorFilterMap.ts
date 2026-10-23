import {
  type ErrorFilter,
  getClassErrorFilterMetadata,
  getClassMethodErrorFilterMetadata,
} from '@inversifyjs/framework-core';
import { type Logger } from '@inversifyjs/logger';
import { type Newable } from 'inversify';

import { setErrorFilterToErrorFilterMap } from '../../http/actions/setErrorFilterToErrorFilterMap.js';

export function buildErrorTypeToErrorFilterMap(
  logger: Logger,
  target: NewableFunction,
  methodKey: string | symbol,
  errorDiscriminatorToErrorFilterMap: Map<
    string | symbol,
    Newable<ErrorFilter>
  >,
): Map<Newable<Error> | null, Newable<ErrorFilter>> {
  const classErrorTypeToErrorFilterMap: Map<
    Newable<Error> | null,
    Newable<ErrorFilter>
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
    Newable<ErrorFilter>
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
  return new Map([
    ...classErrorTypeToErrorFilterMap,
    ...methodErrorTypeToErrorFilterMap,
  ]);
}
