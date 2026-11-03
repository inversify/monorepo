import { type UwebSocketsMiddleware } from '@inversifyjs/http-uwebsockets';
import { injectable } from 'inversify';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

import { getRoles } from '../../decorators/uwebsocketsRoles.js';

@injectable()
export class RouteValueMetadataUwebSocketsMiddleware implements UwebSocketsMiddleware {
  public async execute(
    request: HttpRequest,
    response: HttpResponse,
    next: () => void,
  ): Promise<undefined> {
    const roles: string[] | undefined = getRoles(request);

    if (roles !== undefined) {
      response.writeHeader('x-route-roles', roles.join(','));
    }

    next();
  }
}
