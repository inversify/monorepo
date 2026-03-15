import { type ServiceIdentifier } from 'inversify';

import { type Middleware } from './Middleware.js';

export interface MiddlewareOptions {
  postHandlerMiddlewareList: ServiceIdentifier<Middleware>[];
  preHandlerMiddlewareList: ServiceIdentifier<Middleware>[];
}
