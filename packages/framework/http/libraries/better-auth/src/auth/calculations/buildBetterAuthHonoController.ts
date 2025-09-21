import { All, Controller, Response } from '@inversifyjs/http-core';
import { BetterAuthOptions } from 'better-auth';
import { Context } from 'hono';
import { inject, Newable } from 'inversify';

import { BetterAuth } from '../models/BetterAuth';
import { betterAuthControllerServiceIdentifier } from '../models/betterAuthControllerServiceIdentifier';
import { betterAuthServiceIdentifier } from '../models/betterAuthServiceIdentifier';

export function buildBetterAuthHonoController(
  basePath: string,
): Newable<unknown> {
  @Controller({
    path: basePath,
    serviceIdentifier: betterAuthControllerServiceIdentifier,
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
