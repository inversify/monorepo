import type { Stream } from 'node:stream';

import { HttpStatusCode } from '../../http/models/HttpStatusCode.js';
import { ErrorHttpResponse } from './ErrorHttpResponse.js';

export class InternalServerErrorHttpResponse extends ErrorHttpResponse {
  constructor(
    body?: object | string | number | boolean | Stream | undefined,
    errorMessage: string = 'Internal Server Error',
    errorOptions?: ErrorOptions,
    headers?: Record<string, string>,
  ) {
    super(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      body,
      errorMessage,
      errorOptions,
      headers,
    );
  }
}
