import {
  HttpStatusCode,
  Interceptor,
  InterceptorTransformObject,
} from '@inversifyjs/http-core';
import express from 'express';

export class WarriorRouteExpressInterceptor
  implements Interceptor<express.Request, express.Response>
{
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
