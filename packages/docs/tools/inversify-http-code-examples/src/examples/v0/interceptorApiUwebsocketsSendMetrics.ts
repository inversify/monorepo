import { UwebSocketsInterceptor } from '@inversifyjs/http-uwebsockets';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

// Begin-example
const METRICS: Record<string, number> = {};

function registerMetrics(path: string): void {
  METRICS[path] = (METRICS[path] ?? 0) + 1;
}

export class UwebsocketsMetricsInterceptor implements UwebSocketsInterceptor {
  public async intercept(
    request: HttpRequest,
    _response: HttpResponse,
    next: () => Promise<unknown>,
  ): Promise<void> {
    const path: string = request.getUrl();

    // before handler
    registerMetrics(path);

    await next();

    // after handler
    registerMetrics(path);
  }
}
// End-example
