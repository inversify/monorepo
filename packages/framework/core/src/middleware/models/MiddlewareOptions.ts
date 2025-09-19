import { ServiceIdentifier } from 'inversify';

import { Middleware } from './Middleware';

export interface MiddlewareOptions {
  postHandlerMiddlewareList: ServiceIdentifier<Middleware>[];
  preHandlerMiddlewareList: ServiceIdentifier<Middleware>[];
}
