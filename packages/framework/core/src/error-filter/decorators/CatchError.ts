import {
  buildEmptySetMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { type BindingScope, injectable, type Newable } from 'inversify';

import { catchErrorMetadataReflectKey } from '../../reflectMetadata/data/catchErrorMetadataReflectKey.js';
import { buildCatchErrorMetadata } from '../calculations/buildCatchErrorMetadata.js';
import { type CatchErrorOptions } from '../models/CatchErrorOptions.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function CatchError(
  errorOrCatchErrorOptions?: Newable<Error> | CatchErrorOptions,
): ClassDecorator {
  return (target: NewableFunction): void => {
    let error: Newable<Error> | null = null;
    let scope: BindingScope | undefined = undefined;

    if (errorOrCatchErrorOptions !== undefined) {
      if (typeof errorOrCatchErrorOptions === 'object') {
        error = errorOrCatchErrorOptions.error ?? null;
        scope = errorOrCatchErrorOptions.scope;
      } else {
        error = errorOrCatchErrorOptions;
      }
    }

    injectable(scope)(target);

    updateOwnReflectMetadata(
      target,
      catchErrorMetadataReflectKey,
      buildEmptySetMetadata,
      buildCatchErrorMetadata(error),
    );
  };
}
