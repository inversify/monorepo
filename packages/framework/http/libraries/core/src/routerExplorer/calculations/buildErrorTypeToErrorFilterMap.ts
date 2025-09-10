import {
  ErrorFilter,
  getClassErrorFilterMetadata,
  getClassMethodErrorFilterMetadata,
} from '@inversifyjs/framework-core';
import { Newable } from 'inversify';

import { setErrorFilterToErrorFilterMap } from '../../http/actions/setErrorFilterToErrorFilterMap';

export function buildErrorTypeToErrorFilterMap(
  target: NewableFunction,
  methodKey: string | symbol,
): Map<Newable<Error> | null, Newable<ErrorFilter>> {
  const errorTypeToErrorFilterMap: Map<
    Newable<Error> | null,
    Newable<ErrorFilter>
  > = new Map();

  for (const errorFilter of getClassMethodErrorFilterMetadata(
    target,
    methodKey,
  )) {
    setErrorFilterToErrorFilterMap(errorTypeToErrorFilterMap, errorFilter);
  }

  for (const errorFilter of getClassErrorFilterMetadata(target)) {
    setErrorFilterToErrorFilterMap(errorTypeToErrorFilterMap, errorFilter);
  }

  return errorTypeToErrorFilterMap;
}
