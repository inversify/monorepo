/* eslint-disable @typescript-eslint/typedef */
// Shift-line-spaces-2
import {
  BetterAuth,
  BetterAuthExpressContainerModule,
} from '@inversifyjs/http-better-auth';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { betterAuth, BetterAuthOptions } from 'better-auth';
import BetterSqlite3 from 'better-sqlite3';
import express from 'express';
import { Container } from 'inversify';

export async function run(): Promise<void> {
  // Begin-example
  const container: Container = new Container();

  const options = {
    database: new BetterSqlite3('./path/to/database.db'),
    emailAndPassword: {
      enabled: true,
    },
  } as const satisfies BetterAuthOptions;

  const betterAuthInstance = betterAuth(options);

  const betterAuthExpressContainerModule: BetterAuthExpressContainerModule<
    typeof options,
    () => BetterAuth<typeof options>
  > = BetterAuthExpressContainerModule.fromOptions(
    '/api/auth',
    betterAuthInstance,
  );

  await container.load(betterAuthExpressContainerModule);

  const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(
    container,
    {
      logger: true,
      useCookies: true,
    },
  );

  const application: express.Application = await adapter.build();

  application.listen();
  // End-example
}
