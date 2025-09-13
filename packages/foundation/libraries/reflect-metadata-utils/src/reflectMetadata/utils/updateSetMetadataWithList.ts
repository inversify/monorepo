export function updateSetMetadataWithList<T>(
  metadataList: Iterable<T>,
): (setMetadata: Set<T>) => Set<T> {
  return (setMetadata: Set<T>): Set<T> => {
    for (const item of metadataList) {
      setMetadata.add(item);
    }

    return setMetadata;
  };
}
