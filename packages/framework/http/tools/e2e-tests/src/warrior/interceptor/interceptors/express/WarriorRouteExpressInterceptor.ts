import {
  HttpStatusCode,
  type InterceptorTransformObject,
} from '@inversifyjs/http-core';
import { type ExpressInterceptor } from '@inversifyjs/http-express';
import type express from 'express';

export class WarriorRouteExpressInterceptor implements ExpressInterceptor {
  public async intercept(
    _request: express.Request,
    response: express.Response,
    next: () => Promise<InterceptorTransformObject>,
  ): Promise<void> {
    response.setHeader('x-warrior-route', 'true');
    await next();
    response.status(HttpStatusCode.ACCEPTED);
  }
}
