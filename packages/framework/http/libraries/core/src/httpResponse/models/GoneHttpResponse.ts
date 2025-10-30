import type { Stream } from 'node:stream';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class GoneHttpResponse extends ErrorHttpResponse {
  constructor(
    body?: object | string | number | boolean | Stream | undefined,
    errorMessage: string = 'Gone',
    errorOptions?: ErrorOptions,
  ) {
    super(HttpStatusCode.GONE, body, errorMessage, errorOptions);
  }
}
