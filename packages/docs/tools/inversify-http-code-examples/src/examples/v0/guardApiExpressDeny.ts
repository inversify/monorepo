import {
  ForbiddenHttpResponse,
  Guard,
  HttpResponse,
} from '@inversifyjs/http-core';
import { Request } from 'express';

// Begin-example
export class ExpressDenyGuard implements Guard<Request> {
  public activate(_request: Request): HttpResponse {
    return new ForbiddenHttpResponse('Missing or invalid credentials');
  }
}
// End-example
