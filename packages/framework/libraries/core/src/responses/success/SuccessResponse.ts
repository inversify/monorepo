import { Stream } from 'node:stream';

import { isResponse } from '../calculations/isResponse';
import { isResponse as isResponseSymbol, Response } from '../Response';
import { StatusCode } from '../StatusCode';

const isSuccessResponse: unique symbol = Symbol.for(
  '@inversifyjs/framework-core/SuccessResponse',
);

export class SuccessResponse implements Response {
  public [isResponseSymbol]: true;
  public [isSuccessResponse]: true;

  constructor(
    public readonly statusCode: StatusCode,
    public readonly body?: object | string | number | boolean | Stream,
  ) {
    this[isResponseSymbol] = true;
    this[isSuccessResponse] = true;
  }

  public static is(value: unknown): value is SuccessResponse {
    return (
      isResponse(value) &&
      (value as Partial<SuccessResponse>)[isSuccessResponse] === true
    );
  }
}
