import { Newable } from 'inversify';

export function buildCatchExceptionMetadata(
  key: Newable<Error>,
  value: NewableFunction,
): (
  catchExceptionMetadata: Map<Newable<Error>, NewableFunction[]>,
) => Map<Newable<Error>, NewableFunction[]> {
  return (
    catchExceptionMetadata: Map<Newable<Error>, NewableFunction[]>,
  ): Map<Newable<Error>, NewableFunction[]> => {
    const targetList: NewableFunction[] = catchExceptionMetadata.get(key) ?? [];

    targetList.push(value);

    catchExceptionMetadata.set(key, targetList);

    return catchExceptionMetadata;
  };
}
