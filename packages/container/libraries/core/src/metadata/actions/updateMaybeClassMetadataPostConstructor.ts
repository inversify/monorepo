import { MaybeClassMetadata } from '../models/MaybeClassMetadata';

export function updateMaybeClassMetadataPostConstructor(
  methodName: string | symbol,
): (metadata: MaybeClassMetadata) => MaybeClassMetadata {
  return (metadata: MaybeClassMetadata): MaybeClassMetadata => {
    metadata.lifecycle.postConstructMethodNames.push(methodName);

    return metadata;
  };
}
