import { type BetterAuthOptions } from 'better-auth';
import type express from 'express';

import { type BetterAuth } from '../models/BetterAuth.js';
import { type UserSession } from '../models/UserSession.js';
import { getBetterAuthFromRequest } from './getBetterAuthFromRequest.js';

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
