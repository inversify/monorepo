import { Stream } from 'node:stream';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import {
  HttpResponse,
  isHttpResponse as isHttpResponseSymbol,
} from './HttpResponse';

export class ErrorHttpResponse extends Error implements HttpResponse {
  public readonly [isHttpResponseSymbol]: true;
  public readonly body?:
    | object
    | string
    | number
    | boolean
    | Stream
    | undefined;

  constructor(
    public readonly statusCode: HttpStatusCode,
    body?: object | string | number | boolean | Stream | undefined,
    message?: string | undefined,
    errorOptions?: ErrorOptions | undefined,
  ) {
    super(message, errorOptions);

    this.body = body;
    this[isHttpResponseSymbol] = true;
  }
}
