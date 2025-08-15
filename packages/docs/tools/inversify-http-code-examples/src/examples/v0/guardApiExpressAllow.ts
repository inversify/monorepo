import { Guard } from '@inversifyjs/http-core';
import { Request } from 'express';

// Begin-example
export class ExpressAllowGuard implements Guard<Request> {
  public async activate(_request: Request): Promise<boolean> {
    return true;
  }
}
// End-example
