import { Controller, Get, Request } from '@inversifyjs/http-core';
import { type Request as ExpressRequest } from 'express';
import { injectable } from 'inversify';

// Extend the Express Request type
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      traceId?: string;
    }
  }
}

// Begin-example
@injectable()
@Controller('/example')
export class TracingController {
  @Get()
  public example(@Request() req: ExpressRequest): string {
    return `Trace ID: ${req.traceId ?? 'unknown'}`;
  }
}
// End-example
