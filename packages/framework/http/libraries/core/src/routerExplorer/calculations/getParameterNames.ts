// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function getParameterNames(fn: Function): string[] {
  const src: string = fn.toString();
  const match: RegExpMatchArray | null = src.match(/\(([^)]*)\)/);
  if (match === null) return [];
  return match[1]!
    .split(',')
    .map((p: string) => p.trim().replace(/[:=].*/s, '').trim())
    .filter(Boolean);
}
