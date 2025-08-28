import {
  buildEmptyMapMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { BindingScope, injectable, Newable } from 'inversify';

import { catchExceptionMetadataReflectKey } from '../../reflectMetadata/data/catchExceptionMetadataReflectKey';
import { buildCatchExceptionMetadata } from '../calculations/buildCatchExceptionMetadata';
import { CatchExceptionOptions } from '../models/CatchExceptionOptions';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function CatchException(
  errorOrCatchExceptionOptions?: Newable<Error> | CatchExceptionOptions,
): ClassDecorator {
  return (target: NewableFunction): void => {
    let error: Newable<Error> = Error;

    let scope: BindingScope | undefined = undefined;

    if (errorOrCatchExceptionOptions !== undefined) {
      if (typeof errorOrCatchExceptionOptions === 'object') {
        error = errorOrCatchExceptionOptions.error ?? Error;
        scope = errorOrCatchExceptionOptions.scope;
      } else {
        error = errorOrCatchExceptionOptions;
      }
    }

    injectable(scope)(target);

    updateOwnReflectMetadata(
      Reflect,
      catchExceptionMetadataReflectKey,
      buildEmptyMapMetadata,
      buildCatchExceptionMetadata(error, target),
    );
  };
}
