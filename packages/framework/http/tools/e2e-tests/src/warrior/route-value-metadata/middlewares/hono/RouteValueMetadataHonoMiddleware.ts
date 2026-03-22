import { HonoMiddleware } from '@inversifyjs/http-hono';
import { Context, HonoRequest, Next } from 'hono';
import { injectable } from 'inversify';

import { getRoles } from '../../decorators/honoRoles';

@injectable()
export class RouteValueMetadataHonoMiddleware implements HonoMiddleware {
  public async execute(
    _request: HonoRequest,
    context: Context,
    next: Next,
  ): Promise<undefined> {
    const roles: string[] | undefined = getRoles(context);

    if (roles !== undefined) {
      context.header('x-route-roles', roles.join(','));
    }

    await next();
  }
}
