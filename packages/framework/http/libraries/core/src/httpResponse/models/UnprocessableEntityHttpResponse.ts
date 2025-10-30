import Stream from 'node:stream';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class UnprocessableEntityHttpResponse extends ErrorHttpResponse {
  constructor(
    body?: object | string | number | boolean | Stream | undefined,
    errorMessage?: string,
    errorOptions?: ErrorOptions,
  ) {
    super(
      HttpStatusCode.UNPROCESSABLE_ENTITY,
      body,
      errorMessage,
      errorOptions,
    );
  }
}
