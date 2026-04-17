export function maybeCoerceStringToNullableNumber(
  value: string | undefined,
): number | string | null {
  if (value === undefined || value === '') {
    return null;
  }

  const parsed: number = Number(value);

  if (isNaN(parsed)) {
    return value;
  }

  return parsed;
}
