import type { Stream } from 'node:stream';

import { HttpStatusCode } from '../../http/models/HttpStatusCode.js';
import { ErrorHttpResponse } from './ErrorHttpResponse.js';

export class ConflictHttpResponse extends ErrorHttpResponse {
  constructor(
    body?: object | string | number | boolean | Stream | undefined,
    errorMessage: string = 'Conflict',
    errorOptions?: ErrorOptions,
    headers?: Record<string, string>,
  ) {
    super(HttpStatusCode.CONFLICT, body, errorMessage, errorOptions, headers);
  }
}
