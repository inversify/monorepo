// Begin-example
import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';
import {
  createRouteValueMetadataUtils,
  type UwebSocketsMiddleware,
} from '@inversifyjs/http-uwebsockets';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
const [Roles, getRoles]: [
  decorator: (value: string[]) => MethodDecorator,
  getter: (request: HttpRequest) => string[] | undefined,
] = createRouteValueMetadataUtils<string[]>('ROLES');

export class RolesMiddleware implements UwebSocketsMiddleware {
  public execute(
    request: HttpRequest,
    response: HttpResponse,
    next: () => void,
  ): void {
    const roles: string[] | undefined = getRoles(request);

    if (roles !== undefined) {
      response.cork((): void => {
        response.writeHeader('x-route-roles', roles.join(','));
      });
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
