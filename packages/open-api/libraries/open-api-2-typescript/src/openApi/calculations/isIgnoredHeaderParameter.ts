const IGNORED_HEADER_PARAMETER_NAMES: ReadonlySet<string> = new Set([
  'accept',
  'authorization',
  'content-type',
]);

export function isIgnoredHeaderParameter(
  location: string,
  name: string,
): boolean {
  return (
    location === 'header' &&
    IGNORED_HEADER_PARAMETER_NAMES.has(name.toLocaleLowerCase('en-US'))
  );
}
