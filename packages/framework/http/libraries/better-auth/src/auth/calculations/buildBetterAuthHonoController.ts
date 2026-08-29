import {
  All,
  Controller,
  type ResponseParam,
} from '@inversifyjs/http-core';
import { type BetterAuthOptions } from 'better-auth';
import { type Context } from 'hono';
import { type Newable } from 'inversify';
import { type Reflect as Inject, type WithReflectMetadata as Injectable } from 'rflct';

import { type BetterAuth } from '../models/BetterAuth.js';

export function buildBetterAuthHonoController(
  basePath: string,
  serviceIdentifier: symbol,
): Newable<unknown> {
  @Controller({
    path: basePath,
    serviceIdentifier,
  })
  class BetterAuthHonoController<TOptions extends BetterAuthOptions>
    implements Injectable
  {
    readonly #auth: BetterAuth<TOptions>;

    constructor(
      auth: Inject<BetterAuth<TOptions>>,
    ) {
      this.#auth = auth;
    }

    @All('/*')
    public async handle(c: ResponseParam<Context>): Promise<Response> {
      return this.#auth.handler(c.req.raw);
    }
  }

  return BetterAuthHonoController;
}
