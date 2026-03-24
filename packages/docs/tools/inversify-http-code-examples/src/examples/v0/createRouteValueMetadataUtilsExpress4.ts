// Begin-example
import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';
import {
  createRouteValueMetadataUtils,
  type ExpressMiddleware,
} from '@inversifyjs/http-express-v4';
import { type NextFunction, type Request, type Response } from 'express4';

// eslint-disable-next-line @typescript-eslint/naming-convention
const [Roles, getRoles]: [
  decorator: (value: string[]) => MethodDecorator,
  getter: (request: Request) => string[] | undefined,
] = createRouteValueMetadataUtils<string[]>('ROLES');

export class RolesMiddleware implements ExpressMiddleware {
  public execute(
    request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    const roles: string[] | undefined = getRoles(request);

    if (roles !== undefined) {
      response.setHeader('x-route-roles', roles.join(','));
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
