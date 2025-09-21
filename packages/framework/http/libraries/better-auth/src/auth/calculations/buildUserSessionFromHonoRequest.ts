import { BetterAuthOptions } from 'better-auth';
import { HonoRequest } from 'hono';

import { BetterAuth } from '../models/BetterAuth';
import { UserSession } from '../models/UserSession';
import { getBetterAuthFromRequest } from './getBetterAuthFromRequest';

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
