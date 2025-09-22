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
  class SessionController {
    @ApplyMiddleware(betterAuthMiddlewareServiceIdentifier)
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
