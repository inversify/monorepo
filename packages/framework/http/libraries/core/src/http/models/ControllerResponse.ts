import { Readable } from 'node:stream';

import { HttpResponse } from '../../httpResponse/models/HttpResponse';

export type ControllerResponse =
  | HttpResponse
  | object
  | string
  | number
  | boolean
  | Readable
  | undefined;
