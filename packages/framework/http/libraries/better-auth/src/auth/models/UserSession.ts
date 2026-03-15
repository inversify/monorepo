import { type BetterAuthOptions, type Session, type User } from 'better-auth';

export interface UserSession<TOptions extends BetterAuthOptions> {
  session: Session<TOptions>;
  user: User<TOptions>;
}
