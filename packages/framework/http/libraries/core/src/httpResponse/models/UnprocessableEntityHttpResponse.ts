import type { Stream } from 'node:stream';

import { HttpStatusCode } from '../../http/models/HttpStatusCode.js';
import { ErrorHttpResponse } from './ErrorHttpResponse.js';

export class UnprocessableEntityHttpResponse extends ErrorHttpResponse {
  constructor(
    body?: object | string | number | boolean | Stream | undefined,
    errorMessage: string = 'Unprocessable Entity',
    errorOptions?: ErrorOptions,
    headers?: Record<string, string>,
  ) {
    super(
      HttpStatusCode.UNPROCESSABLE_ENTITY,
      body,
      errorMessage,
      errorOptions,
      headers,
    );
  }
}
