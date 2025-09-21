import {
  BetterAuthOptions,
  InferSession,
  InferUser,
  PrettifyDeep,
} from 'better-auth';

export interface UserSession<TOptions extends BetterAuthOptions> {
  session: PrettifyDeep<InferSession<TOptions>>;
  user: PrettifyDeep<InferUser<TOptions>>;
}
