export function maybeCoerceStringToNullableBoolean(
  value: string | undefined,
): boolean | string | null | undefined {
  switch (value) {
    case 'true':
      return true;
    case 'false':
      return false;
    case '':
      return null;
    case undefined:
      return null;
    default:
      return value;
  }
}
