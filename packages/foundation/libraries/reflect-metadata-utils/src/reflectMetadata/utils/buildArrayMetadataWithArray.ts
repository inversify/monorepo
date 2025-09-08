export function buildArrayMetadataWithArray<T>(
  newArrayMetadata: Iterable<T>,
): (arrayMetadata: T[]) => T[] {
  return (arrayMetadata: T[]): T[] => {
    arrayMetadata.push(...newArrayMetadata);

    return arrayMetadata;
  };
}
