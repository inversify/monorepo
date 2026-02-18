import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { type MaybeClassMetadata } from '../models/MaybeClassMetadata.js';

export function updateMaybeClassMetadataPostConstructor(
  methodName: string | symbol,
): (metadata: MaybeClassMetadata) => MaybeClassMetadata {
  return (metadata: MaybeClassMetadata): MaybeClassMetadata => {
    if (metadata.lifecycle.postConstructMethodNames.has(methodName)) {
      throw new InversifyCoreError(
        InversifyCoreErrorKind.injectionDecoratorConflict,
        `Unexpected duplicated postConstruct method ${methodName.toString()}`,
      );
    }

    metadata.lifecycle.postConstructMethodNames.add(methodName);

    return metadata;
  };
}
