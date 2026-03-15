import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

import { betterAuth, type BetterAuthOptions } from 'better-auth';
import BetterSqlite3 from 'better-sqlite3';
import { Container, type Newable } from 'inversify';

import { buildUwebSocketsJsServer } from '../../server/adapter/uwebsockets/actions/buildUwebSocketsJsServer.js';
import { type Server } from '../../server/models/Server.js';
import { createDirectory } from '../../test/actions/createDirectory.js';
import { generateAndRunBetterAuthMigrations } from '../../test/actions/generateBetterAuthMigrations.js';
import { removeFileIfExists } from '../../test/actions/removeFileIfExists.js';
import { type BetterAuth } from '../models/BetterAuth.js';
import { BetterAuthUwebSocketsContainerModule } from './BetterAuthUwebSocketsContainerModule.js';

describe(BetterAuthUwebSocketsContainerModule, () => {
  let db: BetterSqlite3.Database;
  let dbPath: string;
  let options: {
    database: BetterSqlite3.Database;
    emailAndPassword: {
      enabled: boolean;
    };
  };

  beforeAll(async () => {
    dbPath = './temp/better-auth-container-uwebsockets-module.db';

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

  describe('having a Better Auth UwebSockets server', () => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();

      // eslint-disable-next-line @typescript-eslint/typedef
      const betterAuthInstance = betterAuth(options);

      const betterAuthUwebSocketsContainerModule: BetterAuthUwebSocketsContainerModule<
        typeof options,
        () => BetterAuth<typeof options>
      > = BetterAuthUwebSocketsContainerModule.fromOptions(
        '/api/auth',
        betterAuthInstance,
      );

      await container.loadAsync(betterAuthUwebSocketsContainerModule);

      server = await buildUwebSocketsJsServer(container);
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
              Origin: `http://${server.host}:${server.port.toString()}`,
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

  describe('having a Better Auth UwebSockets server with transform', () => {
    let transformMock: Mock<(controller: Newable<unknown>) => Newable<unknown>>;
    let server: Server;

    beforeAll(async () => {
      transformMock = vitest.fn((controller: Newable<unknown>) => controller);

      const container: Container = new Container();

      // eslint-disable-next-line @typescript-eslint/typedef
      const betterAuthInstance = betterAuth(options);

      const betterAuthUwebSocketsContainerModule: BetterAuthUwebSocketsContainerModule<
        typeof options,
        () => BetterAuth<typeof options>
      > = BetterAuthUwebSocketsContainerModule.fromOptions(
        '/api/auth',
        betterAuthInstance,
        transformMock,
      );

      await container.loadAsync(betterAuthUwebSocketsContainerModule);

      server = await buildUwebSocketsJsServer(container);
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
