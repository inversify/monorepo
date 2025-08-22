import { ForbiddenResponse, Guard } from '@inversifyjs/http-core';
import { Request } from 'express';

// Begin-example
export class ExpressDenyGuard implements Guard<Request> {
  public activate(_request: Request): boolean {
    throw new ForbiddenResponse('Missing or invalid credentials');
  }
}
// End-example
