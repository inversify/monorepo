import { Newable } from 'inversify';

import { Middleware } from './Middleware';
import { MiddlewarePhase } from './MiddlewarePhase';

export interface ApplyMiddlewareOptions {
  phase: MiddlewarePhase;
  middleware: Newable<Middleware> | Newable<Middleware>[];
}
