export function getPath(url: string): string {
  const queryIndex: number = url.indexOf('?');

  const firstPathIndex: number = url.indexOf('/');

  if (firstPathIndex === -1) {
    return '/';
  }

  if (firstPathIndex > 0) {
    return new URL(url).pathname;
  }

  return queryIndex === -1
    ? url.substring(firstPathIndex)
    : url.substring(firstPathIndex, queryIndex);
}
