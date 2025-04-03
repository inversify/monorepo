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
  RequestHandler as ExpressRequestHandler,
  Response,
  Router,
} from 'express';
import { Container } from 'inversify';

export class InversifyExpressHttpAdapter extends InversifyHttpAdapter<
  Request,
  Response,
  NextFunction,
  void
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

  protected _buildRouter(
    routerParams: RouterParams<Request, Response, NextFunction, void>,
  ): void {
    const router: Router = Router();

    const orderedMiddlewareList: MiddlewareHandler<
      Request,
      Response,
      NextFunction,
      void
    >[] = [...routerParams.guardList, ...routerParams.preHandlerMiddlewareList];

    if (orderedMiddlewareList.length > 0) {
      router.use(orderedMiddlewareList as ExpressRequestHandler[]);
    }

    for (const routeParams of routerParams.routeParamsList) {
      const orderedPreHandlerMiddlewareList:
        | MiddlewareHandler<Request, Response, NextFunction, void>[]
        | undefined = [
        ...routeParams.guardList,
        ...routeParams.preHandlerMiddlewareList,
      ];

      const orderedPostHandlerMiddlewareList:
        | MiddlewareHandler<Request, Response, NextFunction, void>[]
        | undefined = [
        ...routerParams.postHandlerMiddlewareList,
        ...routeParams.postHandlerMiddlewareList,
      ];

      router[routeParams.requestMethodType](
        routeParams.path,
        ...(orderedPreHandlerMiddlewareList as ExpressRequestHandler[]),
        routeParams.handler as ExpressRequestHandler,
        ...(orderedPostHandlerMiddlewareList as ExpressRequestHandler[]),
      );
    }

    this.#app.use(routerParams.path, router);
  }

  protected _replyText(
    _request: Request,
    response: Response,
    value: string,
  ): void {
    response.send(value);
  }

  protected _replyJson(
    _request: Request,
    response: Response,
    value?: object,
  ): void {
    response.json(value);
  }

  protected _replyStream(
    _request: Request,
    response: Response,
    value: Stream,
  ): void {
    value.pipe(response);
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
