/* eslint-disable @typescript-eslint/no-unused-vars */
// Shift-line-spaces-2
import {
  betterAuthMiddlewareServiceIdentifier,
  ExpressUserSession,
  UserSession,
} from '@inversifyjs/http-better-auth';
import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';
import { BetterAuthOptions } from 'better-auth';

export async function run(): Promise<void> {
  // Begin-example
  @Controller('/api')
  class UserController {
    @ApplyMiddleware(betterAuthMiddlewareServiceIdentifier)
    @Get('/profile')
    public async getProfile(
      @ExpressUserSession() session: UserSession<BetterAuthOptions>,
    ): Promise<UserSession<BetterAuthOptions>> {
      return session;
    }
  }
  // End-example
}
