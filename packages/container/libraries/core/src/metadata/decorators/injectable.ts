import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { type BindingScope } from '../../binding/models/BindingScope.js';
import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey.js';
import { setIsInjectableFlag } from '../actions/setIsInjectableFlag.js';
import { updateClassMetadataWithTypescriptParameterTypes } from '../actions/updateClassMetadataWithTypescriptParameterTypes.js';
import { getDefaultClassMetadata } from '../calculations/getDefaultClassMetadata.js';
import { type MaybeClassMetadata } from '../models/MaybeClassMetadata.js';

export function injectable(scope?: BindingScope): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return (target: Function): void => {
    setIsInjectableFlag(target);

    updateClassMetadataWithTypescriptParameterTypes(target);

    if (scope !== undefined) {
      updateOwnReflectMetadata<MaybeClassMetadata>(
        target,
        classMetadataReflectKey,
        getDefaultClassMetadata,
        (metadata: MaybeClassMetadata) => ({
          ...metadata,
          scope,
        }),
      );
    }
  };
}
