import { type Newable } from 'inversify';

import { InversifyFrameworkCoreError } from '../../error/models/InversifyFrameworkCoreError.js';
import { InversifyFrameworkCoreErrorKind } from '../../error/models/InversifyFrameworkCoreErrorKind.js';

export function buildCatchErrorMetadata(
  errorType: Newable<Error> | null,
): (
  catchErrorMetadata: Set<Newable<Error> | null>,
) => Set<Newable<Error> | null> {
  return (
    catchErrorMetadata: Set<Newable<Error> | null>,
  ): Set<Newable<Error> | null> => {
    if (catchErrorMetadata.has(errorType)) {
      throw new InversifyFrameworkCoreError(
        InversifyFrameworkCoreErrorKind.injectionDecoratorConflict,
        `CatchError for error type '${errorType?.name ?? 'null'}' is already defined.`,
      );
    }

    catchErrorMetadata.add(errorType);

    return catchErrorMetadata;
  };
}
