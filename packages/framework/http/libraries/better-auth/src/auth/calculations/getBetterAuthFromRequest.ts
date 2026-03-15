import { InternalServerErrorHttpResponse } from '@inversifyjs/http-core';
import { type BetterAuthOptions } from 'better-auth';

import { type BetterAuth } from '../models/BetterAuth.js';
import { betterAuthProperty } from '../models/betterAuthProperty.js';

export function getBetterAuthFromRequest<TOptions extends BetterAuthOptions>(
  request: object,
): BetterAuth<TOptions> {
  const auth: BetterAuth<TOptions> | undefined = (
    request as unknown as Record<string | symbol, unknown>
  )[betterAuthProperty] as BetterAuth<TOptions> | undefined;

  if (auth === undefined) {
    throw new InternalServerErrorHttpResponse(
      undefined,
      'BetterAuth auth not found when accessing user session. Did you forget to apply the BetterAuth middleware?',
    );
  }

  return auth;
}
