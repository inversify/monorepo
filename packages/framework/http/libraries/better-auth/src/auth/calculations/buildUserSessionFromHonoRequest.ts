import { type BetterAuthOptions } from 'better-auth';
import { type HonoRequest } from 'hono';

import { type BetterAuth } from '../models/BetterAuth.js';
import { type UserSession } from '../models/UserSession.js';
import { getBetterAuthFromRequest } from './getBetterAuthFromRequest.js';

export async function buildUserSessionFromHonoRequest(
  request: HonoRequest,
): Promise<UserSession<BetterAuthOptions> | null> {
  const auth: BetterAuth<BetterAuthOptions> = getBetterAuthFromRequest(request);

  const headers: Headers = new Headers();

  const cookieHeader: string | undefined = request.header('cookie');

  if (cookieHeader !== undefined) {
    headers.append('cookie', cookieHeader);
  }

  return auth.api.getSession({ asResponse: false, headers });
}
