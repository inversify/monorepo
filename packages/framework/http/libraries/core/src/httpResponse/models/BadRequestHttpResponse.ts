import type { Stream } from 'node:stream';

import { HttpStatusCode } from '../../http/models/HttpStatusCode.js';
import { ErrorHttpResponse } from './ErrorHttpResponse.js';

export class BadRequestHttpResponse extends ErrorHttpResponse {
  constructor(
    body?: object | string | number | boolean | Stream | undefined,
    errorMessage: string = 'Bad Request',
    errorOptions?: ErrorOptions,
    headers?: Record<string, string>,
  ) {
    super(
      HttpStatusCode.BAD_REQUEST,
      body,
      errorMessage,
      errorOptions,
      headers,
    );
  }
}
