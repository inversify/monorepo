import { getFirstIteratorResult } from '../actions/getFirstIteratorResult.js';

export function getFirstIterableResult<T>(
  iterable: Iterable<T> | undefined,
): T | undefined {
  return getFirstIteratorResult(iterable?.[Symbol.iterator]());
}
