import {
  betterAuthMiddlewareServiceIdentifier,
  HonoUserSession,
  UserSession,
} from '@inversifyjs/http-better-auth';
import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';
import { BetterAuthOptions } from 'better-auth';

// Begin-example

// ❌ This does NOT work - middleware not applied
@Controller('/api')
export class BadController {
  @Get('/profile')
  public async getProfile(
    @HonoUserSession() session: UserSession<BetterAuthOptions>, // Error!
  ): Promise<UserSession<BetterAuthOptions>> {
    return session;
  }
}

// ✅ This works - middleware properly applied
@ApplyMiddleware(betterAuthMiddlewareServiceIdentifier)
@Controller('/api')
export class GoodController {
  @Get('/profile')
  public async getProfile(
    @HonoUserSession() session: UserSession<BetterAuthOptions>,
  ): Promise<UserSession<BetterAuthOptions>> {
    return session;
  }
}
// End-example
