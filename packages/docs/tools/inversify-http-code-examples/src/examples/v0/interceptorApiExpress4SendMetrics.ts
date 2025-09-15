import { Interceptor } from '@inversifyjs/http-core';
import { Request, Response } from 'express4';

// Begin-example
const METRICS: Record<string, number> = {};

function registerMetrics(path: string): void {
  METRICS[path] = (METRICS[path] ?? 0) + 1;
}

export class Express4MetricsInterceptor
  implements Interceptor<Request, Response>
{
  public async intercept(
    request: Request,
    _response: Response,
    next: () => Promise<unknown>,
  ): Promise<void> {
    const path: string = request.path;

    // before handler
    registerMetrics(path);

    await next();

    // after handler
    registerMetrics(path);
  }
}
// End-example
