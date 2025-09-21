import { betterAuth, BetterAuthOptions } from 'better-auth';

export type BetterAuth<TOptions extends BetterAuthOptions> = ReturnType<
  typeof betterAuth<TOptions>
>;
