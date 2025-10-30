import { ExpressInterceptor } from '@inversifyjs/http-express';
import { Request, Response } from 'express';

// Begin-example
const METRICS: Record<string, number> = {};

function registerMetrics(path: string): void {
  METRICS[path] = (METRICS[path] ?? 0) + 1;
}

export class ExpressMetricsInterceptor implements ExpressInterceptor {
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
