export function buildArrayMetadataWithIndex<T>(
  newMetadata: T,
  index: number,
): (arrayMetadata: T[]) => T[] {
  return (arrayMetadata: T[]): T[] => {
    arrayMetadata[index] = newMetadata;

    return arrayMetadata;
  };
}
