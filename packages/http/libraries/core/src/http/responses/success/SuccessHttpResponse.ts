import { Stream } from 'stream';

import { HttpResponse } from '../HttpResponse';
import { HttpStatusCode } from '../HttpStatusCode';

const isSuccessHttpResponseSymbol: unique symbol = Symbol.for(
  '@inversifyjs/http-core/SuccessHttpResponse',
);

export class SuccessHttpResponse implements HttpResponse {
  public [isSuccessHttpResponseSymbol]: true;

  constructor(
    public readonly statusCode: HttpStatusCode,
    public readonly body?: object | string | number | boolean | Stream,
  ) {
    this[isSuccessHttpResponseSymbol] = true;
  }

  public static is(value: unknown): value is SuccessHttpResponse {
    return (
      typeof value === 'object' &&
      value !== null &&
      (value as Record<string | symbol, unknown>)[
        isSuccessHttpResponseSymbol
      ] === true
    );
  }
}
