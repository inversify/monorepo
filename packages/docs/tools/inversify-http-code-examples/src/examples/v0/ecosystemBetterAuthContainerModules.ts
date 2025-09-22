/* eslint-disable @typescript-eslint/typedef */
// Shift-line-spaces-2
import {
  BetterAuth,
  BetterAuthExpressContainerModule,
} from '@inversifyjs/http-better-auth';
import { betterAuth, BetterAuthOptions } from 'better-auth';
import BetterSqlite3 from 'better-sqlite3';
import { Container } from 'inversify';

export async function run(): Promise<void> {
  // Begin-example
  const options = {
    database: new BetterSqlite3('./auth.db'),
    emailAndPassword: {
      enabled: true,
    },
  } as const satisfies BetterAuthOptions;

  const container: Container = new Container();

  const betterAuthInstance: BetterAuth<typeof options> = betterAuth(options);

  const containerModule: BetterAuthExpressContainerModule<
    typeof options,
    () => BetterAuth<typeof options>
  > = BetterAuthExpressContainerModule.fromOptions(
    '/api/auth',
    betterAuthInstance,
  );

  await container.load(containerModule);
  // End-example
}
