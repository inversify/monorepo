// Begin-example
import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';
import {
  createRouteValueMetadataUtils,
  type HonoMiddleware,
} from '@inversifyjs/http-hono';
import { type Context, type HonoRequest, type Next } from 'hono';

// eslint-disable-next-line @typescript-eslint/naming-convention
const [Roles, getRoles]: [
  decorator: (value: string[]) => MethodDecorator,
  getter: (request: HonoRequest) => string[] | undefined,
] = createRouteValueMetadataUtils<string[]>('ROLES');

export class RolesMiddleware implements HonoMiddleware {
  public async execute(
    request: HonoRequest,
    context: Context,
    next: Next,
  ): Promise<Response | undefined> {
    const roles: string[] | undefined = getRoles(request);

    if (roles !== undefined) {
      context.header('x-route-roles', roles.join(','));
    }

    await next();

    return undefined;
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
