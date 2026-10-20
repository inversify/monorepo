const REQUEST_URL_LIKE_PARAM: string = 'requestUrlLike';

export function readRequestUrlLike(search: string): string {
  return new URLSearchParams(search).get(REQUEST_URL_LIKE_PARAM) ?? '';
}

export function buildSearchWithRequestUrlLike(
  search: string,
  requestUrlLike: string,
): string {
  const params: URLSearchParams = new URLSearchParams(search);

  if (requestUrlLike.length > 0) {
    params.set(REQUEST_URL_LIKE_PARAM, requestUrlLike);
  } else {
    params.delete(REQUEST_URL_LIKE_PARAM);
  }

  const query: string = params.toString();

  return query.length > 0 ? `?${query}` : '';
}
