export function toPascalCase(value: string): string {
  const tokens: string[] = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter((token: string) => token.length > 0);

  return tokens
    .map(
      (token: string) =>
        `${token.charAt(0).toUpperCase()}${token.slice(1).toLowerCase()}`,
    )
    .join('');
}
