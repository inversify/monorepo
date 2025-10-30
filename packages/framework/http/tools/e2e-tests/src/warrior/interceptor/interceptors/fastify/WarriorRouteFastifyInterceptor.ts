import {
  HttpStatusCode,
  InterceptorTransformObject,
} from '@inversifyjs/http-core';
import { FastifyInterceptor } from '@inversifyjs/http-fastify';
import { FastifyReply, FastifyRequest } from 'fastify';

export class WarriorRouteFastifyInterceptor implements FastifyInterceptor {
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
