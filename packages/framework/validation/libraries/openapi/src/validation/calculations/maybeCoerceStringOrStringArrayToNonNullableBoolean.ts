import { type MaybeArray } from '../../comon/models/MaybeArray.js';
import { maybeCoerceStringToNonNullableBoolean } from './maybeCoerceStringToNonNullableBoolean.js';

export function maybeCoerceStringOrStringArrayToNonNullableBoolean(
  value: string | string[] | undefined,
): MaybeArray<boolean | string | undefined> {
  if (Array.isArray(value)) {
    return value.map((v: string): boolean | string | undefined =>
      maybeCoerceStringToNonNullableBoolean(v),
    );
  } else {
    return maybeCoerceStringToNonNullableBoolean(value);
  }
}
