import { Stream } from 'node:stream';

import { HttpStatusCode } from './HttpStatusCode';

export interface HttpResponse {
  statusCode: HttpStatusCode;
  body?: object | string | number | boolean | Stream | undefined;
}
