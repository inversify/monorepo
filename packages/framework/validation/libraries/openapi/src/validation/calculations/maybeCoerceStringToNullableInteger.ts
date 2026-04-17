export function maybeCoerceStringToNullableInteger(
  value: string | undefined,
): number | string | null {
  if (value === undefined || value === '') {
    return null;
  }

  const parsed: number = parseInt(value);

  if (isNaN(parsed)) {
    return value;
  }

  return parsed;
}
