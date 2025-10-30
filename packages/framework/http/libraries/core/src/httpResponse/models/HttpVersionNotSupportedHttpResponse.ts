import Stream from 'node:stream';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

export class HttpVersionNotSupportedHttpResponse extends ErrorHttpResponse {
  constructor(
    body?: object | string | number | boolean | Stream | undefined,
    errorMessage?: string,
    errorOptions?: ErrorOptions,
  ) {
    super(
      HttpStatusCode.HTTP_VERSION_NOT_SUPPORTED,
      body,
      errorMessage,
      errorOptions,
    );
  }
}
