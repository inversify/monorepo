import { Stream } from 'node:stream';

import { isResponse } from '../calculations/isResponse';
import { isResponse as isResponseSymbol, Response } from '../Response';
import { StatusCode } from '../StatusCode';

const isErrorResponse: unique symbol = Symbol.for(
  '@inversifyjs/framework-core/ErrorResponse',
);

export class ErrorResponse extends Error implements Response {
  public readonly [isResponseSymbol]: true;
  public readonly [isErrorResponse]: true;
  public readonly body?: object | string | number | boolean | Stream;

  constructor(
    public readonly statusCode: StatusCode,
    error: string,
    message?: string,
    errorOptions?: ErrorOptions,
  ) {
    super(message, errorOptions);

    this.body = { error, message, statusCode };
    this[isErrorResponse] = true;
    this[isResponseSymbol] = true;
  }

  public static is(value: unknown): value is ErrorResponse {
    return (
      isResponse(value) &&
      (value as Partial<ErrorResponse>)[isErrorResponse] === true
    );
  }
}
