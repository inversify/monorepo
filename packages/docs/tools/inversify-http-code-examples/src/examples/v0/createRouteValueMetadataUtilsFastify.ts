// Begin-example
import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';
import {
  createRouteValueMetadataUtils,
  type FastifyMiddleware,
} from '@inversifyjs/http-fastify';
import { type FastifyReply, type FastifyRequest } from 'fastify';

// eslint-disable-next-line @typescript-eslint/naming-convention
const [Roles, getRoles]: [
  decorator: (value: string[]) => MethodDecorator,
  getter: (request: FastifyRequest) => string[] | undefined,
] = createRouteValueMetadataUtils<string[]>('ROLES');

export class RolesMiddleware implements FastifyMiddleware {
  public execute(
    request: FastifyRequest,
    response: FastifyReply,
    next: () => void,
  ): void {
    const roles: string[] | undefined = getRoles(request);

    if (roles !== undefined) {
      response.header('x-route-roles', roles.join(','));
    }

    next();
  }
}

@Controller('/users')
export class UsersController {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RolesMiddleware)
  @Get()
  public async getUsers(): Promise<string> {
    return 'users';
  }
}
// End-example
