import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { type MaybeClassMetadata } from '../models/MaybeClassMetadata.js';

export function updateMaybeClassMetadataPreDestroy(
  methodName: string | symbol,
): (metadata: MaybeClassMetadata) => MaybeClassMetadata {
  return (metadata: MaybeClassMetadata): MaybeClassMetadata => {
    if (metadata.lifecycle.preDestroyMethodNames.has(methodName)) {
      throw new InversifyCoreError(
        InversifyCoreErrorKind.injectionDecoratorConflict,
        `Unexpected duplicated preDestroy method ${methodName.toString()}`,
      );
    }

    metadata.lifecycle.preDestroyMethodNames.add(methodName);

    return metadata;
  };
}
