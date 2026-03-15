import { type BetterAuthOptions } from 'better-auth';
import { type HttpRequest } from 'uWebSockets.js';

import { type BetterAuth } from '../models/BetterAuth.js';
import { type UserSession } from '../models/UserSession.js';
import { getBetterAuthFromRequest } from './getBetterAuthFromRequest.js';

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
