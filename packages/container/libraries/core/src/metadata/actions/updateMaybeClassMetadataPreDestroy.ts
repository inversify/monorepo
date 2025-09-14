import { MaybeClassMetadata } from '../models/MaybeClassMetadata';

export function updateMaybeClassMetadataPreDestroy(
  methodName: string | symbol,
): (metadata: MaybeClassMetadata) => MaybeClassMetadata {
  return (metadata: MaybeClassMetadata): MaybeClassMetadata => {
    metadata.lifecycle.preDestroyMethodNames.push(methodName);

    return metadata;
  };
}
