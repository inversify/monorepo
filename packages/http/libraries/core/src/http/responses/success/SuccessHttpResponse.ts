import { Stream } from 'node:stream';

import { isHttpResponse } from '../calculations/isHttpResponse';
import {
  HttpResponse,
  isHttpResponse as isHttpResponseSymbol,
} from '../HttpResponse';
import { HttpStatusCode } from '../HttpStatusCode';

export class SuccessHttpResponse implements HttpResponse {
  public [isHttpResponseSymbol]: true;

  constructor(
    public readonly statusCode: HttpStatusCode,
    public readonly body?: object | string | number | boolean | Stream,
  ) {
    this[isHttpResponseSymbol] = true;
  }

  public static is(value: unknown): value is SuccessHttpResponse {
    return (
      isHttpResponse(value) &&
      value.statusCode >= HttpStatusCode.OK &&
      value.statusCode < HttpStatusCode.AMBIGUOUS
    );
  }
}
