import {
  HttpResponse,
  isHttpResponse as isHttpResponseSymbol,
} from '../models/HttpResponse';

export function isHttpResponse(value: unknown): value is HttpResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Partial<HttpResponse>)[isHttpResponseSymbol] === true
  );
}
