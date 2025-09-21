import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { betterAuth, BetterAuthOptions } from 'better-auth';
import BetterSqlite3 from 'better-sqlite3';
import { Container } from 'inversify';

import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer';
import { Server } from '../../server/models/Server';
import { createDirectory } from '../../test/actions/createDirectory';
import { generateAndRunBetterAuthMigrations } from '../../test/actions/generateBetterAuthMigrations';
import { removeFileIfExists } from '../../test/actions/removeFileIfExists';
import { BetterAuth } from '../models/BetterAuth';
import { BetterAuthFastifyContainerModule } from './BetterAuthFastifyContainerModule';

describe(BetterAuthFastifyContainerModule, () => {
  let db: BetterSqlite3.Database;

  beforeAll(async () => {
    const dbPath: string = './temp/better-auth-container-fastify-module.db';

    await createDirectory('./temp');
    await removeFileIfExists(dbPath);

    db = new BetterSqlite3(dbPath);
  });

  describe('having a Better Auth Fastify server', () => {
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

      server = await buildFastifyServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    describe('when user sign up and login', () => {
      let formUrlEncodedEmailFixture: string;
      let jsonEmailFixture: string;
      let usernameFixture: string;
      let passwordFixture: string;

      let signUpFormUrlEncodedResponse: Response;
      let signUpJsonResponse: Response;

      beforeAll(async () => {
        formUrlEncodedEmailFixture = 'mail@sample.com';
        jsonEmailFixture = 'mail2@sample.com';
        usernameFixture = 'username';
        passwordFixture = 'P4ssw0rd!';

        signUpFormUrlEncodedResponse = await fetch(
          `http://${server.host}:${server.port.toString()}/api/auth/sign-up/email`,
          {
            body: new URLSearchParams({
              email: formUrlEncodedEmailFixture,
              name: usernameFixture,
              password: passwordFixture,
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
          },
        );

        signUpJsonResponse = await fetch(
          `http://${server.host}:${server.port.toString()}/api/auth/sign-up/email`,
          {
            body: JSON.stringify({
              email: jsonEmailFixture,
              name: usernameFixture,
              password: passwordFixture,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          },
        );
      });

      it('should sign up successfully with a form-urlencoded request', () => {
        expect(signUpFormUrlEncodedResponse.status).toBe(200);
      });

      it('should sign up successfully with a JSON request', () => {
        expect(signUpJsonResponse.status).toBe(200);
      });
    });
  });
});
