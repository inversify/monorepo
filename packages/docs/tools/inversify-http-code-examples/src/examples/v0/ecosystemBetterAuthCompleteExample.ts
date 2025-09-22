/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/typedef */
// Shift-line-spaces-2
import {
  BetterAuthHonoContainerModule,
  betterAuthMiddlewareServiceIdentifier,
  HonoUserSession,
  UserSession,
} from '@inversifyjs/http-better-auth';
import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';
import { InversifyHonoHttpAdapter } from '@inversifyjs/http-hono';
import { betterAuth, BetterAuthOptions } from 'better-auth';
import BetterSqlite3 from 'better-sqlite3';
import { Container } from 'inversify';

export async function run(): Promise<void> {
  // Begin-example
  // 1. Configure Better Auth
  const options = {
    database: new BetterSqlite3('./auth.db'),
    emailAndPassword: {
      enabled: true,
    },
  } as const satisfies BetterAuthOptions;

  const betterAuthInstance = betterAuth(options);

  // 2. Create container and load Better Auth module
  const container: Container = new Container();

  const betterAuthModule = BetterAuthHonoContainerModule.fromOptions(
    '/api/auth',
    betterAuthInstance,
  );

  await container.load(betterAuthModule);

  // 3. Create a controller that uses authentication
  @Controller('/api')
  class UserController {
    @ApplyMiddleware(betterAuthMiddlewareServiceIdentifier)
    @Get('/profile')
    public async getProfile(
      @HonoUserSession() session: UserSession<typeof options>,
    ): Promise<UserSession<typeof options>> {
      return session;
    }
  }

  // 4. Register your controllers
  container.bind(UserController).toSelf();

  // 5. Build and run the application
  const adapter = new InversifyHonoHttpAdapter(container);
  const app = await adapter.build();
  // End-example
}
