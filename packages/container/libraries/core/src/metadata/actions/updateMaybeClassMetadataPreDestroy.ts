import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { MaybeClassMetadata } from '../models/MaybeClassMetadata';

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
