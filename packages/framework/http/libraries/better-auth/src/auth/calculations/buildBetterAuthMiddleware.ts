import { type Middleware } from '@inversifyjs/http-core';
import { type BetterAuthOptions } from 'better-auth';
import { type Newable } from 'inversify';

import { type BetterAuth } from '../models/BetterAuth.js';
import { betterAuthProperty } from '../models/betterAuthProperty.js';

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
