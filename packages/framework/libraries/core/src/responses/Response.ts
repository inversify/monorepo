import { Stream } from 'node:stream';

import { StatusCode } from './StatusCode';

export const isResponse: unique symbol = Symbol.for(
  '@inversifyjs/framework-core/Response',
);

export interface Response {
  [isResponse]: true;
  statusCode: StatusCode;
  body?: object | string | number | boolean | Stream | undefined;
}
