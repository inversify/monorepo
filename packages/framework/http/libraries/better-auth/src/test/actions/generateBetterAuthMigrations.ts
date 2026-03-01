import { BetterAuthOptions } from 'better-auth';
import { getMigrations } from 'better-auth/db/migration';

export async function generateAndRunBetterAuthMigrations(
  options: BetterAuthOptions,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/typedef
  const { runMigrations } = await getMigrations(options);

  await runMigrations();
}
