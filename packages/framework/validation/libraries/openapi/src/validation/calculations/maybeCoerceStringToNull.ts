export function maybeCoerceStringToNull(
  value: string | undefined,
): string | null | undefined {
  switch (value) {
    case '':
      return null;
    case undefined:
      return null;
    default:
      return value;
  }
}
