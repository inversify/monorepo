import { Middleware, MiddlewarePhase } from '@inversifyjs/framework-core';
import { Newable } from 'inversify';

export interface ApplyMiddlewareOptions {
  phase: MiddlewarePhase;
  middleware: Newable<Middleware> | Newable<Middleware>[];
}
