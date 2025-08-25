export function escapeJsonPointerFragments(...fragments: string[]): string {
  return fragments
    .map((fragment: string) =>
      fragment.replaceAll('~', '~0').replaceAll('/', '~1'),
    )
    .join('/');
}
