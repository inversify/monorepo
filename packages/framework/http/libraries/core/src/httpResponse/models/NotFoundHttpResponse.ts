import type { Stream } from 'node:stream';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class NotFoundHttpResponse extends ErrorHttpResponse {
  constructor(
    body?: object | string | number | boolean | Stream | undefined,
    errorMessage: string = 'Not Found',
    errorOptions?: ErrorOptions,
    headers?: Record<string, string>,
  ) {
    super(HttpStatusCode.NOT_FOUND, body, errorMessage, errorOptions, headers);
  }
}
