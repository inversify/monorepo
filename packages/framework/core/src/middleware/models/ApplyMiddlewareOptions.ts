import { type ServiceIdentifier } from 'inversify';

import { type Middleware } from './Middleware.js';
import { type MiddlewarePhase } from './MiddlewarePhase.js';

export interface ApplyMiddlewareOptions {
  phase: MiddlewarePhase;
  middleware: ServiceIdentifier<Middleware> | ServiceIdentifier<Middleware>[];
}
