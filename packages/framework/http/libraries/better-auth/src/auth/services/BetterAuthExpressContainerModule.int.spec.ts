import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

import { betterAuth, BetterAuthOptions } from 'better-auth';
import BetterSqlite3 from 'better-sqlite3';
import { Container, Newable } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer';
import { Server } from '../../server/models/Server';
import { createDirectory } from '../../test/actions/createDirectory';
import { generateAndRunBetterAuthMigrations } from '../../test/actions/generateBetterAuthMigrations';
import { removeFileIfExists } from '../../test/actions/removeFileIfExists';
import { BetterAuth } from '../models/BetterAuth';
import { BetterAuthExpressContainerModule } from './BetterAuthExpressContainerModule';

describe(BetterAuthExpressContainerModule, () => {
  let db: BetterSqlite3.Database;

  beforeAll(async () => {
    const dbPath: string = './temp/better-auth-container-express-module.db';

    await createDirectory('./temp');
    await removeFileIfExists(dbPath);

    db = new BetterSqlite3(dbPath);
  });

  describe('having a Better Auth Express server', () => {
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

      const betterAuthExpressContainerModule: BetterAuthExpressContainerModule<
        typeof options,
        () => BetterAuth<typeof options>
      > = BetterAuthExpressContainerModule.fromOptions(
        '/api/auth',
        betterAuthInstance,
      );

      await container.load(betterAuthExpressContainerModule);

      server = await buildExpressServer(container);
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

  describe('having a Better Auth Express server with transform', () => {
    let transformMock: Mock<(controller: Newable<unknown>) => Newable<unknown>>;
    let server: Server;

    beforeAll(async () => {
      transformMock = vitest.fn((controller: Newable<unknown>) => controller);

      // eslint-disable-next-line @typescript-eslint/typedef
      const options = {
        database: db,
        emailAndPassword: {
          enabled: true,
        },
      } as const satisfies BetterAuthOptions;

      const container: Container = new Container();

      // eslint-disable-next-line @typescript-eslint/typedef
      const betterAuthInstance = betterAuth(options);

      const betterAuthExpressContainerModule: BetterAuthExpressContainerModule<
        typeof options,
        () => BetterAuth<typeof options>
      > = BetterAuthExpressContainerModule.fromOptions(
        '/api/auth',
        betterAuthInstance,
        transformMock,
      );

      await container.load(betterAuthExpressContainerModule);

      server = await buildExpressServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    it('should call transform()', () => {
      expect(transformMock).toHaveBeenCalledTimes(1);
      expect(transformMock).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});
