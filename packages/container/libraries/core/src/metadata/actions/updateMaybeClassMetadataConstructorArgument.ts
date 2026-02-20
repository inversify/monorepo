import { type MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata.js';
import { type MaybeClassMetadata } from '../models/MaybeClassMetadata.js';

export function updateMaybeClassMetadataConstructorArgument(
  updateMetadata: (
    classMetadata: MaybeClassElementMetadata | undefined,
  ) => MaybeClassElementMetadata,
  index: number,
): (classMetadata: MaybeClassMetadata) => MaybeClassMetadata {
  return (classMetadata: MaybeClassMetadata): MaybeClassMetadata => {
    const propertyMetadata: MaybeClassElementMetadata | undefined =
      classMetadata.constructorArguments[index];

    classMetadata.constructorArguments[index] =
      updateMetadata(propertyMetadata);

    return classMetadata;
  };
}
