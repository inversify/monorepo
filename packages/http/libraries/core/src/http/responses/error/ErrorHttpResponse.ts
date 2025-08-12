import { Stream } from 'node:stream';

import { HttpResponse } from '../HttpResponse';
import { HttpStatusCode } from '../HttpStatusCode';

const isErrorHttpResponseSymbol: unique symbol = Symbol.for(
  '@inversifyjs/http-core/ErrorHttpResponse',
);

export class ErrorHttpResponse extends Error implements HttpResponse {
  public readonly [isErrorHttpResponseSymbol]: true;
  public readonly body?: object | string | number | boolean | Stream;

  constructor(
    public readonly statusCode: HttpStatusCode,
    error: string,
    message?: string,
  ) {
    super();

    this.body = { error, message, statusCode };
    this[isErrorHttpResponseSymbol] = true;
  }

  public static is(value: unknown): value is ErrorHttpResponse {
    return (
      typeof value === 'object' &&
      value !== null &&
      (value as Record<string | symbol, unknown>)[isErrorHttpResponseSymbol] ===
        true
    );
  }
}
