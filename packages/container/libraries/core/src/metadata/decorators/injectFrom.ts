import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey.js';
import { getClassMetadata } from '../calculations/getClassMetadata.js';
import { getDefaultClassMetadata } from '../calculations/getDefaultClassMetadata.js';
import { getExtendedConstructorArguments } from '../calculations/getExtendedConstructorArguments.js';
import { getExtendedLifecycle } from '../calculations/getExtendedLifecycle.js';
import { getExtendedProperties } from '../calculations/getExtendedProperties.js';
import { type ClassMetadata } from '../models/ClassMetadata.js';
import { type InjectFromOptions } from '../models/InjectFromOptions.js';

export function injectFrom(options: InjectFromOptions): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const decorator: ClassDecorator = (target: Function): void => {
    const baseTypeClassMetadata: ClassMetadata = getClassMetadata(options.type);

    updateOwnReflectMetadata(
      target,
      classMetadataReflectKey,
      getDefaultClassMetadata,
      composeUpdateReflectMetadataCallback(options, baseTypeClassMetadata),
    );
  };

  return decorator;
}

function composeUpdateReflectMetadataCallback(
  options: InjectFromOptions,
  baseTypeClassMetadata: ClassMetadata,
): (metadata: ClassMetadata) => ClassMetadata {
  const callback: (metadata: ClassMetadata) => ClassMetadata = (
    typeMetadata: ClassMetadata,
  ): ClassMetadata => ({
    constructorArguments: getExtendedConstructorArguments(
      options,
      baseTypeClassMetadata,
      typeMetadata,
    ),
    lifecycle: getExtendedLifecycle(
      options,
      baseTypeClassMetadata,
      typeMetadata,
    ),
    properties: getExtendedProperties(
      options,
      baseTypeClassMetadata,
      typeMetadata,
    ),
    scope: typeMetadata.scope,
  });

  return callback;
}
