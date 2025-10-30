import { ExpressGuard } from '@inversifyjs/http-express';
import { Request } from 'express';

// Begin-example
export class ExpressAllowGuard implements ExpressGuard {
  public async activate(_request: Request): Promise<boolean> {
    return true;
  }
}
// End-example
