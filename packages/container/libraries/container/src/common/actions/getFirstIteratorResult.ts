export function getFirstIteratorResult<T>(
  iterator: Iterator<T> | undefined,
): T | undefined {
  if (iterator === undefined) {
    return undefined;
  }

  const firstIteratorResult: IteratorResult<T> = iterator.next();

  if (firstIteratorResult.done === true) {
    return undefined;
  }

  return firstIteratorResult.value;
}
