import { inject, injectable } from 'inversify';

import { HttpAdapter } from '../adapter/HttpAdapter';
import { inversifyHttpAdapterSymbol } from '../adapter/InversifyHttpAdapter';
import { Middleware } from '../models/Middleware';
import { ForbiddenHttpResponse } from '../responses/error/ForbiddenHttpResponse';
import { HttpResponse } from '../responses/HttpResponse';

@injectable()
export abstract class Guard<
  TRequest,
  TResponse,
  TNextFunction extends () => void,
> implements Middleware<TRequest, TResponse, TNextFunction>
{
  @inject(inversifyHttpAdapterSymbol)
  protected readonly _httpAdapter!: HttpAdapter<TRequest, TResponse>;

  public async execute(
    request: TRequest,
    response: TResponse,
    next: TNextFunction,
  ): Promise<void> {
    const activate: boolean = await this._activate(request);

    if (!activate) {
      this._httpAdapter.replyHttpResponse(
        request,
        response,
        this._getGuardError(),
      );
    } else {
      next();
    }
  }

  protected _getGuardError(): HttpResponse {
    return new ForbiddenHttpResponse();
  }

  protected abstract _activate(request: TRequest): Promise<boolean> | boolean;
}
