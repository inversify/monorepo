import { BetterAuthOptions } from 'better-auth';
import express from 'express';

import { BetterAuth } from '../models/BetterAuth';
import { UserSession } from '../models/UserSession';
import { getBetterAuthFromRequest } from './getBetterAuthFromRequest';

export async function buildUserSessionFromExpressRequest(
  request: express.Request,
): Promise<UserSession<BetterAuthOptions> | null> {
  const auth: BetterAuth<BetterAuthOptions> = getBetterAuthFromRequest(request);

  const headers: Headers = new Headers();

  if (request.headers.cookie !== undefined) {
    headers.append('cookie', request.headers.cookie);
  }

  return auth.api.getSession({ asResponse: false, headers });
}
