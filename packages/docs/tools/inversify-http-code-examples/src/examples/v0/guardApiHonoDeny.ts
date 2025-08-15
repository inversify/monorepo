import {
  ForbiddenHttpResponse,
  Guard,
  HttpResponse,
} from '@inversifyjs/http-core';
import { HonoRequest } from 'hono';

// Begin-example
export class HonoDenyGuard implements Guard<HonoRequest> {
  public activate(_request: HonoRequest): HttpResponse {
    return new ForbiddenHttpResponse('Missing or invalid credentials');
  }
}
// End-example
