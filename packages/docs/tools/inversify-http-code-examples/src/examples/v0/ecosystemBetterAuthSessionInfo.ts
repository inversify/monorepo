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
  class SessionController {
    @ApplyMiddleware(resolve<BetterAuthMiddleware>())
    @Get('/session-info')
    public async getSessionInfo(
      @HonoUserSession() session: UserSession<BetterAuthOptions>,
    ): Promise<{ sessionId: string; userId: string; expiresAt: Date }> {
      return {
        expiresAt: session.session.expiresAt,
        sessionId: session.session.id,
        userId: session.session.userId,
      };
    }
  }
  // End-example
}
