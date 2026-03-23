import { Middleware } from '@inversifyjs/http-core';
import { FastifyReply, FastifyRequest } from 'fastify';
import { injectable } from 'inversify';

import { getRoles } from '../../decorators/fastifyRoles';

@injectable()
export class RouteValueMetadataFastifyMiddleware implements Middleware<
  FastifyRequest,
  FastifyReply,
  () => void,
  void
> {
  public async execute(
    request: FastifyRequest,
    response: FastifyReply,
    next: () => void,
  ): Promise<void> {
    const roles: string[] | undefined = getRoles(request);

    if (roles !== undefined) {
      response.header('x-route-roles', roles.join(','));
    }

    next();
  }
}
