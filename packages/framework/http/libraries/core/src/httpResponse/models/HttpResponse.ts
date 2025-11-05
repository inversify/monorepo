import type { Stream } from 'node:stream';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';

export const isHttpResponse: unique symbol = Symbol.for(
  '@inversifyjs/http-core/HttpResponse',
);

export interface HttpResponse {
  [isHttpResponse]: true;
  body?: object | string | number | boolean | Stream | undefined;
  headers?: Record<string, string> | undefined;
  statusCode: HttpStatusCode;
}
