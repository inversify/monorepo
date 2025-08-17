import { Guard } from '@inversifyjs/http-core';
import { Request } from 'express4';

// Begin-example
export class Express4AllowGuard implements Guard<Request> {
  public async activate(_request: Request): Promise<boolean> {
    return true;
  }
}
// End-example
