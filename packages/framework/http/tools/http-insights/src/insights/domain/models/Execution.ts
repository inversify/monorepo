import { type Controller } from './Controller.js';
import { type Guard } from './Guard.js';
import { type HttpError } from './HttpError.js';
import { type Interceptor } from './Interceptor.js';
import { type Middleware } from './Middleware.js';
import { type NativeMiddleware } from './NativeMiddleware.js';
import { type Pipe } from './Pipe.js';
import { type Request } from './Request.js';
import { type Response } from './Response.js';

export interface Execution {
  readonly id: string;
  readonly controller: Controller;
  readonly guards: Guard[];
  readonly httpErrors: HttpError[];
  readonly interceptors: Interceptor[];
  readonly middlewares: Middleware[];
  readonly nativeMiddlewares: NativeMiddleware[];
  readonly pipes: Pipe[];
  readonly request: Request;
  readonly response: Response;
}
