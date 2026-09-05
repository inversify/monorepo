import { type ErrorFilter } from '@inversifyjs/framework-core';
import { getBaseType } from '@inversifyjs/prototype-utils';
import { type Container, type Newable } from 'inversify';

import { getErrorFilterFromDiscriminatorMaps } from './getErrorFilterFromDiscriminatorMaps.js';

function* getErrorTypeChain(error: unknown): Generator<Newable | null> {
  if (
    typeof error === 'object' &&
    error !== null &&
    typeof error.constructor === 'function'
  ) {
    let currentType: Newable | undefined = error.constructor as Newable;

    while (
      currentType !== undefined &&
      currentType !== Object &&
      currentType !== Function
    ) {
      yield currentType;

      if (currentType === Error) {
        break;
      }

      currentType = getBaseType(currentType);
    }
  }

  yield null;
}

async function getResolvedErrorFilter<TRequest, TResponse, TResult>(
  container: Container,
  errorFilterOrType: ErrorFilter | Newable<ErrorFilter>,
): Promise<ErrorFilter<unknown, TRequest, TResponse, TResult>> {
  return typeof errorFilterOrType === 'function'
    ? await container.getAsync(errorFilterOrType)
    : errorFilterOrType;
}

export async function getErrorFilterForError<TRequest, TResponse, TResult>(
  container: Container,
  error: unknown,
  errorDiscriminatorToFilterMapList: Map<
    string | symbol,
    ErrorFilter | Newable<ErrorFilter>
  >[],
  errorToFilterMapList: Map<
    Newable<Error> | null,
    ErrorFilter | Newable<ErrorFilter>
  >[],
): Promise<ErrorFilter<unknown, TRequest, TResponse, TResult> | undefined> {
  for (const errorType of getErrorTypeChain(error)) {
    if (errorType !== null) {
      const discriminatedErrorFilterOrType:
        ErrorFilter | Newable<ErrorFilter> | undefined =
        getErrorFilterFromDiscriminatorMaps(
          errorType,
          errorDiscriminatorToFilterMapList,
        );

      if (discriminatedErrorFilterOrType !== undefined) {
        return getResolvedErrorFilter(
          container,
          discriminatedErrorFilterOrType,
        );
      }
    }

    for (const errorToFilterMap of errorToFilterMapList) {
      const errorFilterOrType: ErrorFilter | Newable<ErrorFilter> | undefined =
        errorToFilterMap.get(errorType as Newable<Error> | null);

      if (errorFilterOrType !== undefined) {
        return getResolvedErrorFilter(container, errorFilterOrType);
      }
    }
  }

  return undefined;
}
