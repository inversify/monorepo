import {
  type ErrorFilter,
  getErrorDiscriminatorMetadata,
} from '@inversifyjs/framework-core';
import { getBaseType } from '@inversifyjs/prototype-utils';
import { type Container, type Newable } from 'inversify';

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
  errorDiscriminatorToFilterMapList: Map<
    string | symbol,
    ErrorFilter | Newable<ErrorFilter>
  >[],
  errorToFilterMapList: Map<
    Newable<Error> | null,
    ErrorFilter | Newable<ErrorFilter>
  >[],
): Promise<ErrorFilter<unknown, TRequest, TResponse, TResult> | undefined> {
  if (typeof error === 'object' && error !== null) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const errorConstructor: Function = error.constructor;
    const discriminators: (string | symbol)[] | undefined =
      getErrorDiscriminatorMetadata(errorConstructor);

    for (const discriminator of discriminators ?? []) {
      for (const errorDiscriminatorToFilterMap of errorDiscriminatorToFilterMapList) {
        const errorFilterOrType:
          ErrorFilter | Newable<ErrorFilter> | undefined =
          errorDiscriminatorToFilterMap.get(discriminator);

        if (errorFilterOrType !== undefined) {
          return typeof errorFilterOrType === 'function'
            ? await container.getAsync(errorFilterOrType)
            : errorFilterOrType;
        }
      }
    }
  }

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
