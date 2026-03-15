import type { Stream } from 'node:stream';

import { HttpStatusCode } from '../../http/models/HttpStatusCode.js';
import { ErrorHttpResponse } from './ErrorHttpResponse.js';

export class LoopDetectedHttpResponse extends ErrorHttpResponse {
  constructor(
    body?: object | string | number | boolean | Stream | undefined,
    errorMessage: string = 'Loop Detected',
    errorOptions?: ErrorOptions,
    headers?: Record<string, string>,
  ) {
    super(
      HttpStatusCode.LOOP_DETECTED,
      body,
      errorMessage,
      errorOptions,
      headers,
    );
  }
}
