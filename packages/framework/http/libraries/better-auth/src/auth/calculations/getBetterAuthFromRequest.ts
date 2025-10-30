import { InternalServerErrorHttpResponse } from '@inversifyjs/http-core';
import { BetterAuthOptions } from 'better-auth';

import { BetterAuth } from '../models/BetterAuth';
import { betterAuthProperty } from '../models/betterAuthProperty';

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
