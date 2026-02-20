import { type Newable } from '@inversifyjs/common';

import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { type ClassElementMetadata } from '../models/ClassElementMetadata.js';

export function validateConstructorMetadataArray(
  type: Newable,
  value: (ClassElementMetadata | undefined)[],
): asserts value is ClassElementMetadata[] {
  const undefinedIndexes: number[] = [];

  if (value.length < type.length) {
    throw new InversifyCoreError(
      InversifyCoreErrorKind.missingInjectionDecorator,
      `Found unexpected missing metadata on type "${type.name}". "${type.name}" constructor requires at least ${type.length.toString()} arguments, found ${value.length.toString()} instead.
Are you using @inject, @multiInject or @unmanaged decorators in every non optional constructor argument?

If you're using typescript and want to rely on auto injection, set "emitDecoratorMetadata" compiler option to true`,
    );
  }

  // Using a for loop to ensure empty values are traversed as well
  for (let i: number = 0; i < value.length; ++i) {
    const element: ClassElementMetadata | undefined = value[i];

    if (element === undefined) {
      undefinedIndexes.push(i);
    }
  }

  if (undefinedIndexes.length > 0) {
    throw new InversifyCoreError(
      InversifyCoreErrorKind.missingInjectionDecorator,
      `Found unexpected missing metadata on type "${type.name}" at constructor indexes "${undefinedIndexes.join('", "')}".

Are you using @inject, @multiInject or @unmanaged decorators at those indexes?

If you're using typescript and want to rely on auto injection, set "emitDecoratorMetadata" compiler option to true`,
    );
  }
}
