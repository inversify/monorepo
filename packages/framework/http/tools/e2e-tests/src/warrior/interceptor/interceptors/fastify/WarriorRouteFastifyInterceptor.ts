import {
  HttpStatusCode,
  Interceptor,
  InterceptorTransformObject,
} from '@inversifyjs/http-core';
import { FastifyReply, FastifyRequest } from 'fastify';

export class WarriorRouteFastifyInterceptor
  implements Interceptor<FastifyRequest, FastifyReply>
{
  public async intercept(
    _request: FastifyRequest,
    response: FastifyReply,
    next: () => Promise<InterceptorTransformObject>,
  ): Promise<void> {
    response.header('x-warrior-route', 'true');
    await next();
    response.status(HttpStatusCode.ACCEPTED).send();
  }
}
