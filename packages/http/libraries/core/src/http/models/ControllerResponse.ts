import { Readable } from 'stream';

import { HttpResponse } from '../responses/HttpResponse';

export type ControllerResponse =
  | HttpResponse
  | object
  | string
  | number
  | boolean
  | Readable
  | undefined;
