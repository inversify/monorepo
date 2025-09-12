import {
  HttpStatusCode,
  Interceptor,
  InterceptorTransformObject,
} from '@inversifyjs/http-core';
import express4 from 'express4';

export class WarriorRouteExpressV4Interceptor
  implements Interceptor<express4.Request, express4.Response>
{
  public async intercept(
    _request: express4.Request,
    response: express4.Response,
    next: () => Promise<InterceptorTransformObject>,
  ): Promise<void> {
    response.setHeader('x-warrior-route', 'true');
    await next();
    response.status(HttpStatusCode.ACCEPTED);
  }
}
