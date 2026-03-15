import type { Stream } from 'node:stream';

import { type HttpStatusCode } from '../../http/models/HttpStatusCode.js';
import {
  type HttpResponse,
  isHttpResponse as isHttpResponseSymbol,
} from '../models/HttpResponse.js';

export class SuccessHttpResponse implements HttpResponse {
  public [isHttpResponseSymbol]: true;

  constructor(
    public readonly statusCode: HttpStatusCode,
    public readonly body?: object | string | number | boolean | Stream,
    public readonly headers?: Record<string, string>,
  ) {
    this[isHttpResponseSymbol] = true;
  }
}
