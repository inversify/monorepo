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

import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server';
import { Server } from '../../server/models/Server';
import { createDirectory } from '../../test/actions/createDirectory';
import { generateAndRunBetterAuthMigrations } from '../../test/actions/generateBetterAuthMigrations';
import { removeFileIfExists } from '../../test/actions/removeFileIfExists';
import { BetterAuth } from '../models/BetterAuth';
import { BetterAuthExpress4ContainerModule } from './BetterAuthExpress4ContainerModule';

describe(BetterAuthExpress4ContainerModule, () => {
  let db: BetterSqlite3.Database;
  let dbPath: string;
  let options: {
    database: BetterSqlite3.Database;
    emailAndPassword: {
      enabled: boolean;
    };
  };

  beforeAll(async () => {
    dbPath = './temp/better-auth-container-express-4-module.db';

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

  describe('having a Better Auth Express 4 server', () => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();

      // eslint-disable-next-line @typescript-eslint/typedef
      const betterAuthInstance = betterAuth(options);

      const betterAuthExpressContainerModule: BetterAuthExpress4ContainerModule<
        typeof options,
        () => BetterAuth<typeof options>
      > = BetterAuthExpress4ContainerModule.fromOptions(
        '/api/auth',
        betterAuthInstance,
      );

      await container.load(betterAuthExpressContainerModule);

      server = await buildExpress4Server(container);
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

  describe('having a Better Auth Express 4 server with transform', () => {
    let transformMock: Mock<(controller: Newable<unknown>) => Newable<unknown>>;
    let server: Server;

    beforeAll(async () => {
      transformMock = vitest.fn((controller: Newable<unknown>) => controller);

      const container: Container = new Container();

      // eslint-disable-next-line @typescript-eslint/typedef
      const betterAuthInstance = betterAuth(options);

      const betterAuthExpress4ContainerModule: BetterAuthExpress4ContainerModule<
        typeof options,
        () => BetterAuth<typeof options>
      > = BetterAuthExpress4ContainerModule.fromOptions(
        '/api/auth',
        betterAuthInstance,
        transformMock,
      );

      await container.load(betterAuthExpress4ContainerModule);

      server = await buildExpress4Server(container);
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
