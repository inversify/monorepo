/* eslint-disable @typescript-eslint/no-unused-vars */
// Shift-line-spaces-2
import {
  type BetterAuthMiddleware,
  FastifyUserSession,
  UserSession,
} from '@inversifyjs/http-better-auth';
import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';
import { resolve } from 'rflct';
import { BetterAuthOptions } from 'better-auth';

export async function run(): Promise<void> {
  // Begin-example
  @Controller('/api')
  class UserController {
    @ApplyMiddleware(resolve<BetterAuthMiddleware>())
    @Get('/profile')
    public async getProfile(
      @FastifyUserSession() session: UserSession<BetterAuthOptions>,
    ): Promise<UserSession<BetterAuthOptions>> {
      return session;
    }
  }
  // End-example
}
