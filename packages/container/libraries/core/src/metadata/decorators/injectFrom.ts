import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey';
import { getClassMetadata } from '../calculations/getClassMetadata';
import { getDefaultClassMetadata } from '../calculations/getDefaultClassMetadata';
import { getExtendedConstructorArguments } from '../calculations/getExtendedConstructorArguments';
import { getExtendedLifecycle } from '../calculations/getExtendedLifecycle';
import { getExtendedProperties } from '../calculations/getExtendedProperties';
import { ClassMetadata } from '../models/ClassMetadata';
import { InjectFromOptions } from '../models/InjectFromOptions';

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
