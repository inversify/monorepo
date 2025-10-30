import { HonoInterceptor } from '@inversifyjs/http-hono';
import { type Context, type HonoRequest } from 'hono';

// Begin-example
const METRICS: Record<string, number> = {};

function registerMetrics(path: string): void {
  METRICS[path] = (METRICS[path] ?? 0) + 1;
}

export class HonoMetricsInterceptor implements HonoInterceptor {
  public async intercept(
    request: HonoRequest,
    _context: Context,
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
