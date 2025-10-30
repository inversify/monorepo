import type { Stream } from 'node:stream';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class NotImplementedHttpResponse extends ErrorHttpResponse {
  constructor(
    body?: object | string | number | boolean | Stream | undefined,
    errorMessage: string = 'Not Implemented',
    errorOptions?: ErrorOptions,
  ) {
    super(HttpStatusCode.NOT_IMPLEMENTED, body, errorMessage, errorOptions);
  }
}
