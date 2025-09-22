/* eslint-disable @typescript-eslint/typedef */
// Shift-line-spaces-2
import {
  BetterAuth,
  BetterAuthExpress4ContainerModule,
} from '@inversifyjs/http-better-auth';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express-v4';
import { betterAuth, BetterAuthOptions } from 'better-auth';
import BetterSqlite3 from 'better-sqlite3';
import express from 'express4';
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

  const betterAuthExpress4ContainerModule: BetterAuthExpress4ContainerModule<
    typeof options,
    () => BetterAuth<typeof options>
  > = BetterAuthExpress4ContainerModule.fromOptions(
    '/api/auth',
    betterAuthInstance,
  );

  await container.load(betterAuthExpress4ContainerModule);

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
