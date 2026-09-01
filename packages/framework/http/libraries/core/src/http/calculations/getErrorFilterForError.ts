import {
  type ErrorFilter,
  getErrorDiscriminatorMetadata,
} from '@inversifyjs/framework-core';
import { getBaseType } from '@inversifyjs/prototype-utils';
import { type Container, type Newable } from 'inversify';

function* getErrorMatchCandidates(
  error: unknown,
): Generator<Newable<Error> | string | symbol | null> {
  if (typeof error === 'object' && error !== null) {
    const errorConstructor: NewableFunction | undefined = (
      error as { constructor?: NewableFunction }
    ).constructor;

    if (errorConstructor !== undefined) {
      const discriminators: (string | symbol)[] | undefined =
        getErrorDiscriminatorMetadata(errorConstructor);

      if (discriminators !== undefined) {
        for (const discriminator of discriminators) {
          yield discriminator;
        }
      }
    }
  }

  if (error instanceof Error) {
    let currentType: Newable<Error> = error.constructor as Newable<Error>;

    while (currentType !== Error) {
      yield currentType;
      currentType = getBaseType(currentType) as Newable<Error>;
    }

    yield currentType;
  }

  yield null;
}

export async function getErrorFilterForError<TRequest, TResponse, TResult>(
  container: Container,
  error: unknown,
  errorToFilterMapList: Map<
    Newable<Error> | null,
    ErrorFilter | Newable<ErrorFilter>
  >[],
): Promise<ErrorFilter<unknown, TRequest, TResponse, TResult> | undefined> {
  for (const candidate of getErrorMatchCandidates(error)) {
    for (const errorToFilterMap of errorToFilterMapList) {
      const errorFilterOrType: ErrorFilter | Newable<ErrorFilter> | undefined =
        (
          errorToFilterMap as Map<unknown, ErrorFilter | Newable<ErrorFilter>>
        ).get(candidate);

      if (errorFilterOrType !== undefined) {
        if (typeof errorFilterOrType === 'function') {
          return container.getAsync(errorFilterOrType);
        }

        return errorFilterOrType;
      }
    }
  }

  return undefined;
}
