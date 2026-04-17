import { type MaybeArray } from '../../comon/models/MaybeArray.js';
import { maybeCoerceStringToNullableInteger } from './maybeCoerceStringToNullableInteger.js';

export function maybeCoerceStringOrStringArrayToNullableInteger(
  value: string | string[] | undefined,
): MaybeArray<number | string | null> {
  if (Array.isArray(value)) {
    return value.map((v: string): number | string | null =>
      maybeCoerceStringToNullableInteger(v),
    );
  } else {
    return maybeCoerceStringToNullableInteger(value);
  }
}
