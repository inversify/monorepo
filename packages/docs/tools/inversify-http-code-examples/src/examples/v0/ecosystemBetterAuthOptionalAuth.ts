/* eslint-disable @typescript-eslint/no-unused-vars */
// Shift-line-spaces-2
import {
  type BetterAuthMiddleware,
  HonoUserSession,
  UserSession,
} from '@inversifyjs/http-better-auth';
import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';
import { resolve } from 'rflct';
import { BetterAuthOptions } from 'better-auth';

export async function run(): Promise<void> {
  // Begin-example
  @Controller('/api')
  class OptionalAuthController {
    @ApplyMiddleware(resolve<BetterAuthMiddleware>())
    @Get('/optional-auth')
    public async optionalAuth(
      @HonoUserSession() session: UserSession<BetterAuthOptions> | null,
    ): Promise<{ authenticated: boolean; userId?: string }> {
      if (session === null) {
        return { authenticated: false };
      }

      return {
        authenticated: true,
        userId: session.user.id,
      };
    }
  }
  // End-example
}
