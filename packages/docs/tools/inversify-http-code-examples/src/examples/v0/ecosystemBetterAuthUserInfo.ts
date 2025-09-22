/* eslint-disable @typescript-eslint/no-unused-vars */
// Shift-line-spaces-2
import {
  betterAuthMiddlewareServiceIdentifier,
  HonoUserSession,
  UserSession,
} from '@inversifyjs/http-better-auth';
import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';
import { BetterAuthOptions } from 'better-auth';

export async function run(): Promise<void> {
  // Begin-example
  @Controller('/api')
  class UserController {
    @ApplyMiddleware(betterAuthMiddlewareServiceIdentifier)
    @Get('/user-info')
    public async getUserInfo(
      @HonoUserSession() session: UserSession<BetterAuthOptions>,
    ): Promise<{ id: string; email: string; name: string }> {
      return {
        email: session.user.email,
        id: session.user.id,
        name: session.user.name,
      };
    }
  }
  // End-example
}
