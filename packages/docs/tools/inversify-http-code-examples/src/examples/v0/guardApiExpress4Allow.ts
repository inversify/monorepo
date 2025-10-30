import { ExpressGuard } from '@inversifyjs/http-express-v4';
import { Request } from 'express4';

// Begin-example
export class Express4AllowGuard implements ExpressGuard {
  public async activate(_request: Request): Promise<boolean> {
    return true;
  }
}
// End-example
