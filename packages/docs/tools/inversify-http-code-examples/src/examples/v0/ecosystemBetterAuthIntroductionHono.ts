/* eslint-disable @typescript-eslint/typedef */
// Shift-line-spaces-2
import { serve } from '@hono/node-server';
import {
  BetterAuth,
  BetterAuthHonoContainerModule,
} from '@inversifyjs/http-better-auth';
import { InversifyHonoHttpAdapter } from '@inversifyjs/http-hono';
import { betterAuth, BetterAuthOptions } from 'better-auth';
import BetterSqlite3 from 'better-sqlite3';
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

  const betterAuthHonoContainerModule: BetterAuthHonoContainerModule<
    typeof options,
    () => BetterAuth<typeof options>
  > = BetterAuthHonoContainerModule.fromOptions(
    '/api/auth',
    betterAuthInstance,
  );

  await container.load(betterAuthHonoContainerModule);

  const adapter: InversifyHonoHttpAdapter = new InversifyHonoHttpAdapter(
    container,
    {
      logger: true,
    },
  );

  const application = await adapter.build();

  serve(application);
  // End-example
}
