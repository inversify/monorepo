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
  const errorTypeToErrorFilterMap: Map<
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
      errorTypeToErrorFilterMap,
      errorFilter,
    );
  }

  for (const errorFilter of getClassErrorFilterMetadata(target)) {
    setErrorFilterToErrorFilterMap(
      logger,
      errorDiscriminatorToErrorFilterMap,
      errorTypeToErrorFilterMap,
      errorFilter,
    );
  }

  return errorTypeToErrorFilterMap;
}
