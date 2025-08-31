export function buildNormalizedPath(path: string): string {
  const segments: string[] = path
    .split('/')
    .filter((segment: string) => segment.length > 0);

  return '/' + segments.join('/');
}
