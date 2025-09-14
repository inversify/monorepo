import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { MaybeClassMetadata } from '../models/MaybeClassMetadata';

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
