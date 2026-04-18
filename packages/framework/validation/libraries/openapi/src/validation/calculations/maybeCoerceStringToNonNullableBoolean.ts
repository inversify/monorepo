export function maybeCoerceStringToNonNullableBoolean(
  value: string | undefined,
): boolean | string | undefined {
  switch (value) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return value;
  }
}
