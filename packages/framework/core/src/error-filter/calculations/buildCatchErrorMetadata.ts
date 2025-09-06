import { getBaseType } from '@inversifyjs/prototype-utils';
import { Newable } from 'inversify';

export function buildCatchErrorMetadata(
  errorType: Newable<Error> | null,
  errorFilterType: NewableFunction,
): (
  catchErrorMetadata: Map<Newable<Error> | null, NewableFunction[]>,
) => Map<Newable<Error> | null, NewableFunction[]> {
  return (
    catchErrorMetadata: Map<Newable<Error> | null, NewableFunction[]>,
  ): Map<Newable<Error> | null, NewableFunction[]> => {
    const targetList: NewableFunction[] = upsertMetadataTargetList(
      errorType,
      errorFilterType,
      catchErrorMetadata,
    );

    if (errorType !== null) {
      // Base error types should also catch derived error types
      propagateBaseTypeErrorFilters(errorType, catchErrorMetadata, targetList);
    }

    return catchErrorMetadata;
  };
}

function upsertMetadataTargetList(
  errorType: Newable<Error> | null,
  errorFilterType: NewableFunction,
  catchErrorMetadata: Map<Newable<Error> | null, NewableFunction[]>,
): NewableFunction[] {
  let targetList: NewableFunction[] | undefined =
    catchErrorMetadata.get(errorType);

  if (targetList === undefined) {
    targetList = [];
    catchErrorMetadata.set(errorType, targetList);
  }

  targetList.push(errorFilterType);

  return targetList;
}

function propagateBaseTypeErrorFilters(
  errorType: Newable,
  catchErrorMetadata: Map<Newable<Error> | null, NewableFunction[]>,
  targetList: NewableFunction[],
): void {
  const baseErrorType: Newable | undefined = getBaseType(errorType);

  if (baseErrorType !== undefined && baseErrorType !== Object) {
    const typeFilterList: NewableFunction[] | undefined =
      catchErrorMetadata.get(baseErrorType as Newable<Error>);

    if (typeFilterList === undefined) {
      propagateBaseTypeErrorFilters(
        baseErrorType,
        catchErrorMetadata,
        targetList,
      );
    } else {
      targetList.push(...typeFilterList);
    }
  }
}
