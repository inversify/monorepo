import { ExpressMiddleware } from '@inversifyjs/http-express-v4';
import { NextFunction, Request, Response } from 'express4';
import { injectable } from 'inversify';

import { getRoles } from '../../decorators/express4Roles';

@injectable()
export class RouteValueMetadataExpressV4Middleware implements ExpressMiddleware {
  public async execute(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    const roles: string[] | undefined = getRoles(request);

    if (roles !== undefined) {
      response.setHeader('x-route-roles', roles.join(','));
    }

    next();
  }
}
