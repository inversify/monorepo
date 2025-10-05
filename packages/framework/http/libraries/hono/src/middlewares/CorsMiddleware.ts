import { Context, HonoRequest, MiddlewareHandler, Next } from 'hono';
import { cors } from 'hono/cors';
import { injectable } from 'inversify';

import { HonoMiddleware } from '../models/HonoMiddleware';

type CorsOptions = Parameters<typeof cors>[0];

@injectable()
export class CorsMiddleware implements HonoMiddleware {
  readonly #corsHandler: MiddlewareHandler;

  constructor(options?: CorsOptions) {
    this.#corsHandler = cors(options);
  }

  public async execute(
    _request: HonoRequest,
    response: Context,
    next: Next,
  ): Promise<Response | undefined> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.#corsHandler(response, next) as Promise<Response | undefined>;
  }
}
