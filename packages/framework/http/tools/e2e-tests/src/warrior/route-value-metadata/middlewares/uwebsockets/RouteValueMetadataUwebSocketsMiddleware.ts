import { UwebSocketsMiddleware } from '@inversifyjs/http-uwebsockets';
import { injectable } from 'inversify';
import { HttpRequest, HttpResponse } from 'uWebSockets.js';

import { getRoles } from '../../decorators/uwebsocketsRoles';

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
