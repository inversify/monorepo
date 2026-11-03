import {
  HttpStatusCode,
  type InterceptorTransformObject,
} from '@inversifyjs/http-core';
import { type FastifyInterceptor } from '@inversifyjs/http-fastify';
import { type FastifyReply, type FastifyRequest } from 'fastify';

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
