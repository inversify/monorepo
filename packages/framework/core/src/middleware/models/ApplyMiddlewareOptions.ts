import { ServiceIdentifier } from 'inversify';

import { Middleware } from './Middleware';
import { MiddlewarePhase } from './MiddlewarePhase';

export interface ApplyMiddlewareOptions {
  phase: MiddlewarePhase;
  middleware: ServiceIdentifier<Middleware> | ServiceIdentifier<Middleware>[];
}
