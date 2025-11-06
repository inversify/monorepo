import { BetterAuthOptions } from 'better-auth';
import { HttpRequest } from 'uWebSockets.js';

import { BetterAuth } from '../models/BetterAuth';
import { UserSession } from '../models/UserSession';
import { getBetterAuthFromRequest } from './getBetterAuthFromRequest';

export async function buildUserSessionFromUwebSocketsRequest(
  request: HttpRequest,
): Promise<UserSession<BetterAuthOptions> | null> {
  const auth: BetterAuth<BetterAuthOptions> = getBetterAuthFromRequest(request);

  const headers: Headers = new Headers();

  const cookieHeader: string = request.getHeader('cookie');

  if (cookieHeader !== '') {
    headers.append('cookie', cookieHeader);
  }

  return auth.api.getSession({ asResponse: false, headers });
}
