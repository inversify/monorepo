import { Stream } from 'node:stream';

import { HttpResponse, isHttpResponse } from '../HttpResponse';
import { HttpStatusCode } from '../HttpStatusCode';

const isSuccessHttpResponse: unique symbol = Symbol.for(
  '@inversifyjs/http-core/ErrorHttpResponse',
);

export class SuccessHttpResponse implements HttpResponse {
  public [isHttpResponse]: true;
  public [isSuccessHttpResponse]: true;

  constructor(
    public readonly statusCode: HttpStatusCode,
    public readonly body?: object | string | number | boolean | Stream,
  ) {
    this[isHttpResponse] = true;
    this[isSuccessHttpResponse] = true;
  }

  public static is(value: unknown): value is SuccessHttpResponse {
    return (
      typeof value === 'object' &&
      value !== null &&
      (value as Partial<SuccessHttpResponse>)[isSuccessHttpResponse] === true
    );
  }
}
