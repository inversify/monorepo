import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  ApplyMiddleware,
  Controller,
  Get,
  HttpStatusCode,
} from '@inversifyjs/http-core';
import { betterAuth, BetterAuthOptions } from 'better-auth';
import BetterSqlite3 from 'better-sqlite3';
import { Container } from 'inversify';

import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer';
import { Server } from '../../server/models/Server';
import { createDirectory } from '../../test/actions/createDirectory';
import { generateAndRunBetterAuthMigrations } from '../../test/actions/generateBetterAuthMigrations';
import { removeFileIfExists } from '../../test/actions/removeFileIfExists';
import { BetterAuth } from '../models/BetterAuth';
import { betterAuthMiddlewareServiceIdentifier } from '../models/betterAuthMiddlewareServiceIdentifier';
import { UserSession } from '../models/UserSession';
import { BetterAuthFastifyContainerModule } from '../services/BetterAuthFastifyContainerModule';
import { FastifyUserSession } from './FastifyUserSession';

@Controller('/api')
class SessionTestController {
  @ApplyMiddleware(betterAuthMiddlewareServiceIdentifier)
  @Get('/session')
  public async getSession(
    @FastifyUserSession() session: UserSession<BetterAuthOptions>,
  ): Promise<UserSession<BetterAuthOptions>> {
    return session;
  }
}

describe(FastifyUserSession, () => {
  let db: BetterSqlite3.Database;

  beforeAll(async () => {
    const dbPath: string = './temp/fastify-user-session.db';

    await createDirectory('./temp');
    await removeFileIfExists(dbPath);

    db = new BetterSqlite3(dbPath);
  });

  describe('having a Better Auth Fastify server with session endpoint', () => {
    let server: Server;

    beforeAll(async () => {
      // eslint-disable-next-line @typescript-eslint/typedef
      const options = {
        database: db,
        emailAndPassword: {
          enabled: true,
        },
      } as const satisfies BetterAuthOptions;

      await generateAndRunBetterAuthMigrations(options);

      const container: Container = new Container();

      // eslint-disable-next-line @typescript-eslint/typedef
      const betterAuthInstance = betterAuth(options);

      const betterAuthFastifyContainerModule: BetterAuthFastifyContainerModule<
        typeof options,
        () => BetterAuth<typeof options>
      > = BetterAuthFastifyContainerModule.fromOptions(
        '/api/auth',
        betterAuthInstance,
      );

      await container.load(betterAuthFastifyContainerModule);

      // Register the session test controller
      container.bind(SessionTestController).toSelf();

      server = await buildFastifyServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    describe('when user signs up and gets session', () => {
      let emailFixture: string;
      let usernameFixture: string;
      let passwordFixture: string;

      let signUpResponse: Response;
      let sessionCookie: string;

      beforeAll(async () => {
        emailFixture = 'user@example.com';
        usernameFixture = 'testuser';
        passwordFixture = 'P4ssw0rd!';

        signUpResponse = await fetch(
          `http://${server.host}:${server.port.toString()}/api/auth/sign-up/email`,
          {
            body: JSON.stringify({
              email: emailFixture,
              name: usernameFixture,
              password: passwordFixture,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          },
        );

        // Extract the session cookie from sign up response
        const setCookieHeader: string | null =
          signUpResponse.headers.get('set-cookie');

        if (setCookieHeader === null) {
          throw new Error('No set-cookie header found in sign up response');
        }

        // Parse the session cookie (better-auth typically sets multiple cookies)
        sessionCookie = setCookieHeader;
      });

      it('should sign up successfully', () => {
        expect(signUpResponse.status).toBe(200);
      });

      describe('when fetching session with authenticated cookie', () => {
        let sessionResponse: Response;
        let sessionData: UserSession<BetterAuthOptions>;

        beforeAll(async () => {
          sessionResponse = await fetch(
            `http://${server.host}:${server.port.toString()}/api/session`,
            {
              headers: {
                Cookie: sessionCookie,
              },
              method: 'GET',
            },
          );

          sessionData =
            (await sessionResponse.json()) as UserSession<BetterAuthOptions>;
        });

        it('should return 200 status', () => {
          expect(sessionResponse.status).toBe(200);
        });

        it('should return user session data', () => {
          expect(sessionData).toBeDefined();
          expect(sessionData.user).toBeDefined();
          expect(sessionData.session).toBeDefined();
        });

        it('should contain correct user information', () => {
          expect(sessionData.user.email).toBe(emailFixture);
          expect(sessionData.user.name).toBe(usernameFixture);
        });

        it('should contain valid session information', () => {
          expect(sessionData.session.id).toBeDefined();
          expect(sessionData.session.userId).toBe(sessionData.user.id);
        });
      });

      describe('when fetching session without authentication cookie', () => {
        let unauthorizedResponse: Response;
        let unauthorizedResponseBody: unknown;

        beforeAll(async () => {
          unauthorizedResponse = await fetch(
            `http://${server.host}:${server.port.toString()}/api/session`,
            {
              method: 'GET',
            },
          );

          unauthorizedResponseBody = await unauthorizedResponse.json();
        });

        it('should handle unauthenticated request gracefully', async () => {
          expect(unauthorizedResponse.status).toBe(HttpStatusCode.OK);
          expect(unauthorizedResponseBody).toBeNull();
        });
      });
    });
  });
});
