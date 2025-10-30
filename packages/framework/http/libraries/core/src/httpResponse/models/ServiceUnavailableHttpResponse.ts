import type { Stream } from 'node:stream';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class ServiceUnavailableHttpResponse extends ErrorHttpResponse {
  constructor(
    body?: object | string | number | boolean | Stream | undefined,
    errorMessage?: string,
    errorOptions?: ErrorOptions,
  ) {
    super(HttpStatusCode.SERVICE_UNAVAILABLE, body, errorMessage, errorOptions);
  }
}
