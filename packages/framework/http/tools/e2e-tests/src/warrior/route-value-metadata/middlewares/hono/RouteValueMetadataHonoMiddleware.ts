import { type HonoMiddleware } from '@inversifyjs/http-hono';
import { type Context, type HonoRequest, type Next } from 'hono';
import { injectable } from 'inversify';

import { getRoles } from '../../decorators/honoRoles.js';

@injectable()
export class RouteValueMetadataHonoMiddleware implements HonoMiddleware {
  public async execute(
    request: HonoRequest,
    context: Context,
    next: Next,
  ): Promise<undefined> {
    const roles: string[] | undefined = getRoles(request);

    if (roles !== undefined) {
      context.header('x-route-roles', roles.join(','));
    }

    await next();
  }
}
