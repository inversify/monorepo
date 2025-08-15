import {
  ForbiddenHttpResponse,
  Guard,
  HttpResponse,
} from '@inversifyjs/http-core';
import { Request } from 'express4';

// Begin-example
export class Express4DenyGuard implements Guard<Request> {
  public activate(_request: Request): HttpResponse {
    return new ForbiddenHttpResponse('Missing or invalid credentials');
  }
}
// End-example
