import {
  HttpStatusCode,
  InterceptorTransformObject,
} from '@inversifyjs/http-core';
import { UwebSocketsInterceptor } from '@inversifyjs/http-uwebsockets';
import { HttpRequest, HttpResponse } from 'uWebSockets.js';

export class WarriorRouteUwebSocketsInterceptor implements UwebSocketsInterceptor {
  public async intercept(
    _request: HttpRequest,
    response: HttpResponse,
    next: () => Promise<InterceptorTransformObject>,
  ): Promise<void> {
    response.cork(() => {
      response.writeStatus(HttpStatusCode.ACCEPTED.toString());
    });

    await next();

    response.cork(() => {
      response.writeHeader('x-warrior-route', 'true');
    });
  }
}
