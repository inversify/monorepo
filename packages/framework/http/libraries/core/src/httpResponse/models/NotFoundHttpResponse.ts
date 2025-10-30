import type { Stream } from 'node:stream';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class NotFoundHttpResponse extends ErrorHttpResponse {
  constructor(
    body?: object | string | number | boolean | Stream | undefined,
    errorMessage?: string,
    errorOptions?: ErrorOptions,
  ) {
    super(HttpStatusCode.NOT_FOUND, body, errorMessage, errorOptions);
  }
}
