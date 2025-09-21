import { BetterAuthOptions } from 'better-auth';
import { FastifyRequest } from 'fastify';

import { BetterAuth } from '../models/BetterAuth';
import { UserSession } from '../models/UserSession';
import { getBetterAuthFromRequest } from './getBetterAuthFromRequest';

export async function buildUserSessionFromFastifyRequest(
  request: FastifyRequest,
): Promise<UserSession<BetterAuthOptions> | null> {
  const auth: BetterAuth<BetterAuthOptions> = getBetterAuthFromRequest(request);

  const headers: Headers = new Headers();

  if (request.headers.cookie !== undefined) {
    headers.append('cookie', request.headers.cookie);
  }

  return auth.api.getSession({ asResponse: false, headers });
}
