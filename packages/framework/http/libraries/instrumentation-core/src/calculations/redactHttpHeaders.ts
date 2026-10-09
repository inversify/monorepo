const REDACTED_HEADER_VALUE: string = '[redacted]';

const REDACTED_HTTP_HEADER_NAMES: ReadonlySet<string> = new Set([
  'authorization',
  'cookie',
  'proxy-authorization',
  'set-cookie',
  'x-api-key',
  'x-auth-token',
]);

export function redactHttpHeaders(
  headers: Readonly<
    Record<string, number | string | readonly string[] | undefined>
  >,
): Record<string, string | readonly string[]> {
  const redactedHeaders: Record<string, string | readonly string[]> = {};

  for (const key in headers) {
    if (!Object.hasOwn(headers, key)) {
      continue;
    }

    const value: number | string | readonly string[] | undefined = headers[key];

    if (value === undefined) {
      continue;
    }

    redactedHeaders[key] = REDACTED_HTTP_HEADER_NAMES.has(key.toLowerCase())
      ? REDACTED_HEADER_VALUE
      : typeof value === 'number'
        ? value.toString()
        : value;
  }

  return Object.freeze(redactedHeaders);
}
