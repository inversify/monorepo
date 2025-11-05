import type { Stream } from 'node:stream';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class NotAcceptableHttpResponse extends ErrorHttpResponse {
  constructor(
    body?: object | string | number | boolean | Stream | undefined,
    errorMessage: string = 'Not Acceptable',
    errorOptions?: ErrorOptions,
    headers?: Record<string, string>,
  ) {
    super(
      HttpStatusCode.NOT_ACCEPTABLE,
      body,
      errorMessage,
      errorOptions,
      headers,
    );
  }
}
