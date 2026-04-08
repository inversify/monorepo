export function getPath(url: string): string {
  const queryIndex: number = url.indexOf('?');

  if (url.startsWith('/')) {
    return queryIndex === -1 ? url : url.substring(0, queryIndex);
  }

  return queryIndex === -1
    ? url.substring(url.indexOf('/'))
    : url.substring(url.indexOf('/'), queryIndex);
}
