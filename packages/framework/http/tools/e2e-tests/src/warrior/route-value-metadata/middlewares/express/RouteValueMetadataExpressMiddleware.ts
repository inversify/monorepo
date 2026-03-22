import { ExpressMiddleware } from '@inversifyjs/http-express';
import { NextFunction, Request, Response } from 'express';
import { injectable } from 'inversify';

import { getRoles } from '../../decorators/expressRoles';

@injectable()
export class RouteValueMetadataExpressMiddleware implements ExpressMiddleware {
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
