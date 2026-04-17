import { type MaybeArray } from '../../comon/models/MaybeArray.js';
import { maybeCoerceStringToNullableBoolean } from './maybeCoerceStringToNullableBoolean.js';

export function maybeCoerceStringOrStringArrayToNullableBoolean(
  value: string | string[] | undefined,
): MaybeArray<boolean | string | null | undefined> {
  if (Array.isArray(value)) {
    return value.map((v: string): boolean | string | null | undefined =>
      maybeCoerceStringToNullableBoolean(v),
    );
  } else {
    return maybeCoerceStringToNullableBoolean(value);
  }
}
