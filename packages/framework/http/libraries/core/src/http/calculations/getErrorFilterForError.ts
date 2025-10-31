import { ErrorFilter } from '@inversifyjs/framework-core';
import { getBaseType } from '@inversifyjs/prototype-utils';
import { Container, Newable } from 'inversify';

function* getErrorBaseTypeChain(
  error: unknown,
): Generator<Newable<Error> | null> {
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
  for (const errorType of getErrorBaseTypeChain(error)) {
    for (const errorToFilterMap of errorToFilterMapList) {
      const errorFilterOrType: ErrorFilter | Newable<ErrorFilter> | undefined =
        errorToFilterMap.get(errorType);

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
