import { All, Controller, Response } from '@inversifyjs/http-core';
import { type BetterAuthOptions } from 'better-auth';
import { type Context } from 'hono';
import { inject, type Newable } from 'inversify';

import { type BetterAuth } from '../models/BetterAuth.js';
import { betterAuthServiceIdentifier } from '../models/betterAuthServiceIdentifier.js';

export function buildBetterAuthHonoController(
  basePath: string,
  serviceIdentifier: symbol,
): Newable<unknown> {
  @Controller({
    path: basePath,
    serviceIdentifier,
  })
  class BetterAuthHonoController<TOptions extends BetterAuthOptions> {
    readonly #auth: BetterAuth<TOptions>;

    constructor(
      @inject(betterAuthServiceIdentifier)
      auth: BetterAuth<TOptions>,
    ) {
      this.#auth = auth;
    }

    @All('/*')
    public async handle(@Response() c: Context): Promise<Response> {
      return this.#auth.handler(c.req.raw);
    }
  }

  return BetterAuthHonoController;
}
