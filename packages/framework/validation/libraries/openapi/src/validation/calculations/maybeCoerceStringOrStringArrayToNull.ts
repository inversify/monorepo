import { type MaybeArray } from '../../comon/models/MaybeArray.js';
import { maybeCoerceStringToNull } from './maybeCoerceStringToNull.js';

export function maybeCoerceStringOrStringArrayToNull(
  value: string | string[] | undefined,
): MaybeArray<string | null | undefined> {
  if (Array.isArray(value)) {
    return value.map((value: string) => maybeCoerceStringToNull(value));
  } else {
    return maybeCoerceStringToNull(value);
  }
}
