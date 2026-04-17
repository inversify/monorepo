export function maybeCoerceStringToNonNullableInteger(
  value: string | undefined,
): number | string | undefined {
  if (value === undefined || value === '') {
    return value;
  }

  const parsed: number = parseInt(value);

  if (isNaN(parsed)) {
    return value;
  }

  return parsed;
}
