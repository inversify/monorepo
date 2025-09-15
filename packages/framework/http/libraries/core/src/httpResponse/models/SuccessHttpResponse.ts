import { Stream } from 'node:stream';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { isHttpResponse } from '../calculations/isHttpResponse';
import {
  HttpResponse,
  isHttpResponse as isHttpResponseSymbol,
} from '../models/HttpResponse';

const isSuccessHttpResponse: unique symbol = Symbol.for(
  '@inversifyjs/http-core/SuccessHttpResponse',
);

export class SuccessHttpResponse implements HttpResponse {
  public [isHttpResponseSymbol]: true;
  public [isSuccessHttpResponse]: true;

  constructor(
    public readonly statusCode: HttpStatusCode,
    public readonly body?: object | string | number | boolean | Stream,
  ) {
    this[isHttpResponseSymbol] = true;
    this[isSuccessHttpResponse] = true;
  }

  public static is(value: unknown): value is SuccessHttpResponse {
    return (
      isHttpResponse(value) &&
      (value as Partial<SuccessHttpResponse>)[isSuccessHttpResponse] === true
    );
  }
}
