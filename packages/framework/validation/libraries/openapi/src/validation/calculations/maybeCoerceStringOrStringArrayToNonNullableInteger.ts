import { type MaybeArray } from '../../comon/models/MaybeArray.js';
import { maybeCoerceStringToNonNullableInteger } from './maybeCoerceStringToNonNullableInteger.js';

export function maybeCoerceStringOrStringArrayToNonNullableInteger(
  value: string | string[] | undefined,
): MaybeArray<number | string | undefined> {
  if (Array.isArray(value)) {
    return value.map((v: string): number | string | undefined =>
      maybeCoerceStringToNonNullableInteger(v),
    );
  } else {
    return maybeCoerceStringToNonNullableInteger(value);
  }
}
