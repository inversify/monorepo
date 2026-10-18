import { type Execution } from '../models/Execution.js';
import { ControllerFixtures } from './ControllerFixtures.js';
import { GuardFixtures } from './GuardFixtures.js';
import { HttpErrorFixtures } from './HttpErrorFixtures.js';
import { InterceptorFixtures } from './InterceptorFixtures.js';
import { MiddlewareFixtures } from './MiddlewareFixtures.js';
import { NativeMiddlewareFixtures } from './NativeMiddlewareFixtures.js';
import { PipeFixtures } from './PipeFixtures.js';
import { RequestFixtures } from './RequestFixtures.js';
import { ResponseFixtures } from './ResponseFixtures.js';

export class ExecutionFixtures {
  public static get any(): Execution {
    return {
      controller: ControllerFixtures.any,
      guards: [GuardFixtures.any],
      httpErrors: [HttpErrorFixtures.any],
      id: 'execution-id',
      interceptors: [InterceptorFixtures.any],
      middlewares: [MiddlewareFixtures.any],
      nativeMiddlewares: [NativeMiddlewareFixtures.any],
      pipes: [PipeFixtures.any],
      request: RequestFixtures.any,
      response: ResponseFixtures.any,
    };
  }
}
