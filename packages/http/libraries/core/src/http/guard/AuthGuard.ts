import { injectable } from 'inversify';

import { UserRequest } from '../models/UserRequest';
import { UnauthorizedHttpResponse } from '../responses/error/UnauthorizedHttpResponse';
import { HttpResponse } from '../responses/HttpResponse';
import { Guard } from './Guard';

@injectable()
export abstract class AuthGuard<
  TRequest extends UserRequest,
  TResponse,
  TNextFunction extends () => void,
> extends Guard<TRequest, TResponse, TNextFunction> {
  protected async _activate(request: TRequest): Promise<boolean> {
    const token: string = await this._getTokenFromRequest(request);
    const user: Record<string, unknown> | undefined =
      await this._validateToken(token);

    if (user !== undefined) {
      request.user = user;
    }

    return user !== undefined;
  }

  protected override _getGuardError(): HttpResponse {
    return new UnauthorizedHttpResponse();
  }

  protected abstract _getTokenFromRequest(
    request: TRequest,
  ): Promise<string> | string;

  protected abstract _validateToken(
    token: string,
  ):
    | Promise<Record<string, unknown> | undefined>
    | Record<string, unknown>
    | undefined;
}
