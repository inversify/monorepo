import { BetterAuthOptions, InferSession, InferUser } from 'better-auth';

export interface UserSession<TOptions extends BetterAuthOptions> {
  session: InferSession<TOptions>;
  user: InferUser<TOptions>;
}
