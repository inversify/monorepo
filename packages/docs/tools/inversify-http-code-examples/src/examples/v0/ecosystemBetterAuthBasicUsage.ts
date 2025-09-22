/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/typedef */
// Shift-line-spaces-2
import { BetterAuth } from '@inversifyjs/http-better-auth';
import { betterAuth, BetterAuthOptions } from 'better-auth';
import BetterSqlite3 from 'better-sqlite3';

export async function run(): Promise<void> {
  // Begin-example
  const options = {
    database: new BetterSqlite3('./auth.db'),
    emailAndPassword: {
      enabled: true,
    },
  } as const satisfies BetterAuthOptions;

  // Type-safe Better Auth instance
  const auth: BetterAuth<typeof options> = betterAuth(options);
  // End-example
}
