import type { Stream } from 'node:stream';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class BadGatewayHttpResponse extends ErrorHttpResponse {
  constructor(
    body?: object | string | number | boolean | Stream | undefined,
    errorMessage?: string,
    errorOptions?: ErrorOptions,
  ) {
    super(HttpStatusCode.BAD_GATEWAY, body, errorMessage, errorOptions);
  }
}
