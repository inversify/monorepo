import { getFirstIteratorResult } from '../actions/getFirstIteratorResult';

export function getFirstIterableResult<T>(
  iterable: Iterable<T> | undefined,
): T | undefined {
  return getFirstIteratorResult(iterable?.[Symbol.iterator]());
}
