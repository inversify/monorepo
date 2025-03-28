import { Stream } from 'node:stream';

import {
  HttpAdapterOptions,
  HttpStatusCode,
  InversifyHttpAdapter,
  MiddlewareHandler,
  RouterParams,
} from '@inversifyjs/http-core';
import express, {
  Application,
  NextFunction,
  Request,
  Response,
  Router,
} from 'express';
import { Container } from 'inversify';

export class InversifyExpressHttpAdapter extends InversifyHttpAdapter<
  Request,
  Response,
  NextFunction
> {
  readonly #app: Application;

  constructor(
    container: Container,
    httpAdapterOptions?: HttpAdapterOptions,
    customApp?: Application,
  ) {
    super(container, httpAdapterOptions);

    this.#app = customApp ?? this.#buildDefaultExpressApp();
  }

  public async build(): Promise<Application> {
    await this._buildServer();

    return this.#app;
  }

  protected override _buildRouter(
    routerParams: RouterParams<Request, Response, NextFunction>,
  ): void {
    const router: Router = Router();

    const orderedMiddlewareList: MiddlewareHandler<
      Request,
      Response,
      NextFunction
    >[] = [...routerParams.guardList, ...routerParams.preHandlerMiddlewareList];

    if (orderedMiddlewareList.length > 0) {
      router.use(orderedMiddlewareList);
    }

    for (const routeParams of routerParams.routeParamsList) {
      const orderedPreHandlerMiddlewareList:
        | MiddlewareHandler<Request, Response, NextFunction>[]
        | undefined = [
        ...routeParams.guardList,
        ...routeParams.preHandlerMiddlewareList,
      ];

      const orderedPostHandlerMiddlewareList:
        | MiddlewareHandler<Request, Response, NextFunction>[]
        | undefined = [
        ...routerParams.postHandlerMiddlewareList,
        ...routeParams.postHandlerMiddlewareList,
      ];

      router[routeParams.requestMethodType](
        routeParams.path,
        ...orderedPreHandlerMiddlewareList,
        routeParams.handler,
        ...orderedPostHandlerMiddlewareList,
      );
    }

    this.#app.use(routerParams.path, router);
  }

  protected _replyText(
    _request: Request,
    response: Response,
    value: string,
  ): unknown {
    return response.send(value);
  }

  protected _replyJson(
    _request: Request,
    response: Response,
    value?: object,
  ): unknown {
    return response.json(value);
  }

  protected _replyStream(
    _request: Request,
    response: Response,
    value: Stream,
  ): unknown {
    return value.pipe(response);
  }

  protected _setStatus(
    _request: Request,
    response: Response,
    statusCode: HttpStatusCode,
  ): void {
    response.status(statusCode);
  }

  protected _setHeader(
    _request: Request,
    response: Response,
    key: string,
    value: string,
  ): void {
    response.setHeader(key, value);
  }

  protected async _getBody(
    request: Request,
    parameterName?: string,
  ): Promise<unknown> {
    return parameterName !== undefined
      ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        request.body[parameterName]
      : request.body;
  }

  protected _getParams(request: Request, parameterName?: string): unknown {
    return parameterName !== undefined
      ? request.params[parameterName]
      : request.params;
  }

  protected _getQuery(request: Request, parameterName?: string): unknown {
    return parameterName !== undefined
      ? request.query[parameterName]
      : request.query;
  }

  protected _getHeaders(request: Request, parameterName?: string): unknown {
    return parameterName !== undefined
      ? request.headers[parameterName]
      : request.headers;
  }

  protected _getCookies(
    request: Request,
    _response: Response,
    parameterName?: string,
  ): unknown {
    return parameterName !== undefined
      ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        request.cookies[parameterName]
      : request.cookies;
  }

  #buildDefaultExpressApp(customApp?: Application): Application {
    const app: Application = customApp ?? express();

    if (this.httpAdapterOptions.useJson) {
      app.use(express.json());
    }

    return app;
  }
}
