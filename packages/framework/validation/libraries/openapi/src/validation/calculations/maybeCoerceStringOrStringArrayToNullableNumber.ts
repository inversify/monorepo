import { type MaybeArray } from '../../comon/models/MaybeArray.js';
import { maybeCoerceStringToNullableNumber } from './maybeCoerceStringToNullableNumber.js';

export function maybeCoerceStringOrStringArrayToNullableNumber(
  value: string | string[] | undefined,
): MaybeArray<number | string | null> {
  if (Array.isArray(value)) {
    return value.map((v: string): number | string | null =>
      maybeCoerceStringToNullableNumber(v),
    );
  } else {
    return maybeCoerceStringToNullableNumber(value);
  }
}
