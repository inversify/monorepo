import { UwebSocketsGuard } from '@inversifyjs/http-uwebsockets';
import { type HttpRequest } from 'uWebSockets.js';

// Begin-example
export class UwebsocketsAllowGuard implements UwebSocketsGuard {
  public async activate(_request: HttpRequest): Promise<boolean> {
    return true;
  }
}
// End-example
