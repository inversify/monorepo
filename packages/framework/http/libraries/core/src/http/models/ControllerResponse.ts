import { type Readable } from 'node:stream';

import { type HttpResponse } from '../../httpResponse/models/HttpResponse.js';

export type ControllerResponse =
  | HttpResponse
  | object
  | string
  | number
  | boolean
  | Readable
  | undefined;
