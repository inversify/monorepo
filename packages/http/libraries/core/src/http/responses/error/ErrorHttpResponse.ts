import { Stream } from 'node:stream';

import { isHttpResponse } from '../calculations/isHttpResponse';
import {
  HttpResponse,
  isHttpResponse as isHttpResponseSymbol,
} from '../HttpResponse';
import { HttpStatusCode } from '../HttpStatusCode';

const httpErrorStatusCodeUpperBound: number = 600;

export class ErrorHttpResponse extends Error implements HttpResponse {
  public readonly [isHttpResponseSymbol]: true;
  public readonly body?: object | string | number | boolean | Stream;

  constructor(
    public readonly statusCode: HttpStatusCode,
    error: string,
    message?: string,
    errorOptions?: ErrorOptions,
  ) {
    super(message, errorOptions);

    this.body = { error, message, statusCode };
    this[isHttpResponseSymbol] = true;
  }

  public static is(value: unknown): value is ErrorHttpResponse {
    return (
      isHttpResponse(value) &&
      value.statusCode >= HttpStatusCode.BAD_REQUEST &&
      value.statusCode < (httpErrorStatusCodeUpperBound as HttpStatusCode)
    );
  }
}
