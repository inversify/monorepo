export function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (
    typeof error === 'number' ||
    typeof error === 'boolean' ||
    typeof error === 'bigint' ||
    typeof error === 'symbol' ||
    typeof error === 'function'
  ) {
    return error.toString();
  }

  if (error === undefined) {
    return 'undefined';
  }

  if (error === null) {
    return 'null';
  }

  try {
    return JSON.stringify(error);
  } catch (_serializationError: unknown) {
    return Object.prototype.toString.call(error);
  }
}
