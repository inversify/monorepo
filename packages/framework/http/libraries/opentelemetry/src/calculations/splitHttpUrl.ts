export function splitHttpUrl(url: string): {
  readonly path: string;
  readonly query: string | undefined;
} {
  const queryIndex: number = url.indexOf('?');

  if (queryIndex === -1) {
    return {
      path: url,
      query: undefined,
    };
  }

  return {
    path: url.slice(0, queryIndex),
    query: url.slice(queryIndex + 1),
  };
}
