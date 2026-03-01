import { BetterAuthOptions, Session, User } from 'better-auth';

export interface UserSession<TOptions extends BetterAuthOptions> {
  session: Session<TOptions>;
  user: User<TOptions>;
}
