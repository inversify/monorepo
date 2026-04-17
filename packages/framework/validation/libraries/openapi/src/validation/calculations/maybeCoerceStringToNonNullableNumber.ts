export function maybeCoerceStringToNonNullableNumber(
  value: string | undefined,
): number | string | undefined {
  if (value === undefined || value === '') {
    return value;
  }

  const parsed: number = parseFloat(value);

  if (isNaN(parsed)) {
    return value;
  }

  return parsed;
}
