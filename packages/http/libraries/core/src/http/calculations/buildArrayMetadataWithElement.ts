export function buildArrayMetadataWithElement<T>(
  newMetadata: T,
): (arrayMetadata: T[]) => T[] {
  return (arrayMetadata: T[]): T[] => {
    arrayMetadata.push(newMetadata);

    return arrayMetadata;
  };
}
