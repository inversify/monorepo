import { type ExecutionFilters } from './executionsApi.js';

const REQUEST_METHOD_PARAM: string = 'requestMethod';
const RESPONSE_STATUS_CODE_PARAM: string = 'responseStatusCode';

export function readExecutionFilters(search: string): ExecutionFilters {
  const params: URLSearchParams = new URLSearchParams(search);
  const requestMethod: string | null = params.get(REQUEST_METHOD_PARAM);

  return {
    requestMethod:
      requestMethod === null || requestMethod.length === 0
        ? undefined
        : requestMethod,
    responseStatusCode: readResponseStatusCode(
      params.get(RESPONSE_STATUS_CODE_PARAM),
    ),
  };
}

export function buildSearchWithExecutionFilters(
  search: string,
  filters: ExecutionFilters,
): string {
  const params: URLSearchParams = new URLSearchParams(search);

  if (filters.requestMethod !== undefined && filters.requestMethod.length > 0) {
    params.set(REQUEST_METHOD_PARAM, filters.requestMethod);
  } else {
    params.delete(REQUEST_METHOD_PARAM);
  }

  if (filters.responseStatusCode !== undefined) {
    params.set(RESPONSE_STATUS_CODE_PARAM, String(filters.responseStatusCode));
  } else {
    params.delete(RESPONSE_STATUS_CODE_PARAM);
  }

  const query: string = params.toString();

  return query.length > 0 ? `?${query}` : '';
}

function readResponseStatusCode(value: string | null): number | undefined {
  if (value === null || !/^\d+$/u.test(value)) {
    return undefined;
  }

  const statusCode: number = Number(value);

  if (!Number.isInteger(statusCode)) {
    return undefined;
  }

  return statusCode;
}
