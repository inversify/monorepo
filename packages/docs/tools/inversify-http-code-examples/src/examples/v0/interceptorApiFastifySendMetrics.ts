import { Interceptor } from '@inversifyjs/http-core';
import { FastifyReply, FastifyRequest } from 'fastify';

// Begin-example
const METRICS: Record<string, number> = {};

function registerMetrics(path: string): void {
  METRICS[path] = (METRICS[path] ?? 0) + 1;
}

export class FastifyMetricsInterceptor
  implements Interceptor<FastifyRequest, FastifyReply>
{
  public async intercept(
    request: FastifyRequest,
    _reply: FastifyReply,
    next: () => Promise<unknown>,
  ): Promise<void> {
    const path: string = request.routeOptions.url ?? '/';

    // before handler
    registerMetrics(path);

    await next();

    // after handler
    registerMetrics(path);
  }
}
// End-example
