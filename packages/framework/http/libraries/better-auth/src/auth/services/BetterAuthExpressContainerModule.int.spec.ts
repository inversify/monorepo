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
  let dbPath: string;
  let options: {
    database: BetterSqlite3.Database;
    emailAndPassword: {
      enabled: boolean;
    };
  };

  beforeAll(async () => {
    dbPath = './temp/better-auth-container-express-module.db';

    await createDirectory('./temp');
    await removeFileIfExists(dbPath);

    db = new BetterSqlite3(dbPath);

    options = {
      database: db,
      emailAndPassword: {
        enabled: true,
      },
    } as const satisfies BetterAuthOptions;

    await generateAndRunBetterAuthMigrations(options);
  });

  afterAll(async () => {
    db.close();
    await removeFileIfExists(dbPath);
  });

  describe('having a Better Auth Express server', () => {
    let server: Server;

    beforeAll(async () => {
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
      let emailFixture: string;
      let usernameFixture: string;
      let passwordFixture: string;

      let signUpResponse: Response;

      beforeAll(async () => {
        emailFixture = 'mail@sample.com';
        usernameFixture = 'username';
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
      });

      it('should sign up successfully', () => {
        expect(signUpResponse.status).toBe(200);
      });
    });
  });

  describe('having a Better Auth Express server with transform', () => {
    let transformMock: Mock<(controller: Newable<unknown>) => Newable<unknown>>;
    let server: Server;

    beforeAll(async () => {
      transformMock = vitest.fn((controller: Newable<unknown>) => controller);

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
      expect(transformMock).toHaveBeenCalledExactlyOnceWith(
        expect.any(Function),
      );
    });
  });
});
