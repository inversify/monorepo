import { Readable } from 'node:stream';

import { Response } from '@inversifyjs/framework-core';

export type ControllerResponse =
  | Response
  | object
  | string
  | number
  | boolean
  | Readable
  | undefined;
