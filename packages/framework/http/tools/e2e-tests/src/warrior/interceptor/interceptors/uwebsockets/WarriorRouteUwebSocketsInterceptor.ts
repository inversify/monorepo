import {
  HttpStatusCode,
  type InterceptorTransformObject,
} from '@inversifyjs/http-core';
import { type UwebSocketsInterceptor } from '@inversifyjs/http-uwebsockets';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

export class WarriorRouteUwebSocketsInterceptor implements UwebSocketsInterceptor {
  public async intercept(
    _request: HttpRequest,
    response: HttpResponse,
    next: () => Promise<InterceptorTransformObject>,
  ): Promise<void> {
    response.cork(() => {
      response.writeStatus(`${HttpStatusCode.ACCEPTED.toString()} Accepted`);
    });

    await next();

    response.cork(() => {
      response.writeHeader('x-warrior-route', 'true');
    });
  }
}
