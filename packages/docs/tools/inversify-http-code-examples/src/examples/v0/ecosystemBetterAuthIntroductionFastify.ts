/* eslint-disable @typescript-eslint/typedef */
// Shift-line-spaces-2
import {
  BetterAuth,
  BetterAuthFastifyContainerModule,
} from '@inversifyjs/http-better-auth';
import { InversifyFastifyHttpAdapter } from '@inversifyjs/http-fastify';
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

  const betterAuthFastifyContainerModule: BetterAuthFastifyContainerModule<
    typeof options,
    () => BetterAuth<typeof options>
  > = BetterAuthFastifyContainerModule.fromOptions(
    '/api/auth',
    betterAuthInstance,
  );

  await container.load(betterAuthFastifyContainerModule);

  const adapter: InversifyFastifyHttpAdapter = new InversifyFastifyHttpAdapter(
    container,
    {
      logger: true,
      useCookies: true,
    },
  );

  const application = await adapter.build();

  await application.listen();
  // End-example
}
