import {
  getOwnReflectMetadata,
  setReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { classIsInjectableFlagReflectKey } from '../../reflectMetadata/data/classIsInjectableFlagReflectKey.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function setIsInjectableFlag(target: Function): void {
  const isInjectableFlag: boolean | undefined = getOwnReflectMetadata<boolean>(
    target,
    classIsInjectableFlagReflectKey,
  );

  if (isInjectableFlag !== undefined) {
    throw new InversifyCoreError(
      InversifyCoreErrorKind.injectionDecoratorConflict,
      `Cannot apply @injectable decorator multiple times at class "${target.name}"`,
    );
  }

  setReflectMetadata(target, classIsInjectableFlagReflectKey, true);
}
