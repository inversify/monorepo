import { type Newable } from '@inversifyjs/common';

import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { type MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata.js';
import { MaybeClassElementMetadataKind } from '../models/MaybeClassElementMetadataKind.js';
import { type MaybeClassMetadata } from '../models/MaybeClassMetadata.js';

export function throwAtInvalidClassMetadata(
  type: Newable,
  classMetadata: MaybeClassMetadata,
): never {
  const errors: string[] = [];

  for (let i: number = 0; i < classMetadata.constructorArguments.length; ++i) {
    const constructorArgument: MaybeClassElementMetadata | undefined =
      classMetadata.constructorArguments[i];

    if (
      constructorArgument === undefined ||
      constructorArgument.kind === MaybeClassElementMetadataKind.unknown
    ) {
      errors.push(
        `  - Missing or incomplete metadata for type "${type.name}" at constructor argument with index ${i.toString()}.
Every constructor parameter must be decorated either with @inject, @multiInject or @unmanaged decorator.`,
      );
    }
  }

  for (const [propertyKey, property] of classMetadata.properties) {
    if (property.kind === MaybeClassElementMetadataKind.unknown) {
      errors.push(
        `  - Missing or incomplete metadata for type "${type.name}" at property "${propertyKey.toString()}".
This property must be decorated either with @inject or @multiInject decorator.`,
      );
    }
  }

  if (errors.length === 0) {
    throw new InversifyCoreError(
      InversifyCoreErrorKind.unknown,
      `Unexpected class metadata for type "${type.name}" with uncompletion traces.
This might be caused by one of the following reasons:

1. A third party library is targeting inversify reflection metadata.
2. A bug is causing the issue. Consider submiting an issue to fix it.`,
    );
  }

  throw new InversifyCoreError(
    InversifyCoreErrorKind.missingInjectionDecorator,
    `Invalid class metadata at type ${type.name}:

${errors.join('\n\n')}`,
  );
}
