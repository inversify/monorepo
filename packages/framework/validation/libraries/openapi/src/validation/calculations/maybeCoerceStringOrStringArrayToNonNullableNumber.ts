import { type MaybeArray } from '../../comon/models/MaybeArray.js';
import { maybeCoerceStringToNonNullableNumber } from './maybeCoerceStringToNonNullableNumber.js';

export function maybeCoerceStringOrStringArrayToNonNullableNumber(
  value: string | string[] | undefined,
): MaybeArray<number | string | undefined> {
  if (Array.isArray(value)) {
    return value.map((v: string): number | string | undefined =>
      maybeCoerceStringToNonNullableNumber(v),
    );
  } else {
    return maybeCoerceStringToNonNullableNumber(value);
  }
}
