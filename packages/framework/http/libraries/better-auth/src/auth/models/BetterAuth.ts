import { type betterAuth, type BetterAuthOptions } from 'better-auth';

export type BetterAuth<TOptions extends BetterAuthOptions> = ReturnType<
  typeof betterAuth<TOptions>
>;
