import { Stream } from 'node:stream';

import {
  HttpResponse,
  isHttpResponse as isHttpResponse,
} from '../HttpResponse';
import { HttpStatusCode } from '../HttpStatusCode';

const isErrorHttpResponse: unique symbol = Symbol.for(
  '@inversifyjs/http-core/ErrorHttpResponse',
);

export class ErrorHttpResponse extends Error implements HttpResponse {
  public readonly [isHttpResponse]: true;
  public readonly [isErrorHttpResponse]: true;
  public readonly body?: object | string | number | boolean | Stream;

  constructor(
    public readonly statusCode: HttpStatusCode,
    error: string,
    message?: string,
    errorOptions?: ErrorOptions,
  ) {
    super(message, errorOptions);

    this.body = { error, message, statusCode };
    this[isErrorHttpResponse] = true;
    this[isHttpResponse] = true;
  }

  public static is(value: unknown): value is ErrorHttpResponse {
    return (
      typeof value === 'object' &&
      value !== null &&
      (value as Partial<ErrorHttpResponse>)[isErrorHttpResponse] === true
    );
  }
}
