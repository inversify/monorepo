const URL_SCHEME_PATTERN: RegExp = /^([a-zA-Z][a-zA-Z+\-.]*):/u;

export function readUrlScheme(value: string): string | null {
  const match: RegExpExecArray | null = URL_SCHEME_PATTERN.exec(value);

  if (match === null) {
    return null;
  }

  const scheme: string | undefined = match[1];

  if (scheme === undefined || scheme.length === 1) {
    return null;
  }

  return scheme.toLowerCase();
}
