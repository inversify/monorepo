import { Middleware } from '@inversifyjs/http-core';
import { BetterAuthOptions } from 'better-auth';
import { Newable } from 'inversify';

import { BetterAuth } from '../models/BetterAuth';
import { betterAuthProperty } from '../models/betterAuthProperty';

export function buildBetterAuthMiddleware<TOptions extends BetterAuthOptions>(
  auth: BetterAuth<TOptions>,
): Newable<Middleware> {
  return class BetterAuthMiddleware implements Middleware {
    public async execute(
      request: Record<symbol, unknown>,
      _response: unknown,
      next: () => void | Promise<void>,
    ): Promise<void> {
      request[betterAuthProperty] = auth;

      await next();
    }
  };
}
