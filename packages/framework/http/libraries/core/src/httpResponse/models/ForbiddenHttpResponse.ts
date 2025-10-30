import type { Stream } from 'node:stream';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class ForbiddenHttpResponse extends ErrorHttpResponse {
  constructor(
    body?: object | string | number | boolean | Stream | undefined,
    errorMessage: string = 'Forbidden',
    errorOptions?: ErrorOptions,
  ) {
    super(HttpStatusCode.FORBIDDEN, body, errorMessage, errorOptions);
  }
}
