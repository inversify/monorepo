/* eslint-disable @typescript-eslint/naming-convention */
import {
  ApplyMiddleware,
  Controller,
  createCustomParameterDecorator,
  Get,
  Middleware,
} from '@inversifyjs/http-core';
import { injectable } from 'inversify';

export interface UserContext {
  user: User;
}

export interface User {
  id: string;
  username: string;
}

@injectable()
export class AuthMiddleware implements Middleware {
  public async execute(
    request: UserContext,
    _response: unknown,
    next: () => void | Promise<void>,
  ): Promise<void> {
    request.user = {
      id: 'a08a7eb9-95c7-46de-94c3-f40dd934825f',
      username: 'mail@example.com',
    };

    await next();
  }
}

// Begin-example
const User: () => ParameterDecorator = () =>
  createCustomParameterDecorator((request: UserContext): User => request.user);

@Controller('/api/users')
export class UsersController {
  @ApplyMiddleware(AuthMiddleware)
  @Get('me')
  public getMe(@User() me: User): User {
    return me;
  }
}
