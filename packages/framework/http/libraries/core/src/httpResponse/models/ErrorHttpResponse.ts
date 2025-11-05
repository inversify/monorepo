import type { Stream } from 'node:stream';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import {
  HttpResponse,
  isHttpResponse as isHttpResponseSymbol,
} from './HttpResponse';

export class ErrorHttpResponse extends Error implements HttpResponse {
  public readonly [isHttpResponseSymbol]: true;

  constructor(
    public readonly statusCode: HttpStatusCode,
    public readonly body?:
      | object
      | string
      | number
      | boolean
      | Stream
      | undefined,
    message?: string | undefined,
    errorOptions?: ErrorOptions | undefined,
    public readonly headers?: Record<string, string> | undefined,
  ) {
    super(message, errorOptions);

    this[isHttpResponseSymbol] = true;
  }
}
