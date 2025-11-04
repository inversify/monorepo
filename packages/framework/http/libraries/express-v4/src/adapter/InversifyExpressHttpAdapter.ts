import { Readable } from 'node:stream';

import {
  HttpStatusCode,
  InversifyHttpAdapter,
  MiddlewareHandler,
  RouterParams,
} from '@inversifyjs/http-core';
import cookieParser from 'cookie-parser';
import express, {
  Application,
  NextFunction,
  Request,
  RequestHandler as ExpressRequestHandler,
  Response,
  Router,
} from 'express';
import { Container } from 'inversify';

import { ExpressHttpAdapterOptions } from '../models/ExpressHttpAdapterOptions';

export class InversifyExpressHttpAdapter extends InversifyHttpAdapter<
  Request,
  Response,
  NextFunction,
  void,
  ExpressHttpAdapterOptions
> {
  readonly #app: Application;

  constructor(
    container: Container,
    httpAdapterOptions?: ExpressHttpAdapterOptions,
    customApp?: Application,
  ) {
    super(
      container,
      {
        logger: true,
        useCookies: false,
        useJson: true,
      },
      httpAdapterOptions,
    );

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

    for (const routeParams of routerParams.routeParamsList) {
      const orderedPreHandlerMiddlewareList: MiddlewareHandler<
        Request,
        Response,
        NextFunction,
        void
      >[] = [...routeParams.preHandlerMiddlewareList, ...routeParams.guardList];

      const orderedPostHandlerMiddlewareList: MiddlewareHandler<
        Request,
        Response,
        NextFunction,
        void
      >[] = routeParams.postHandlerMiddlewareList;

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
    value: Readable,
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

  protected _getBody(
    request: Request,
    _response: Response,
    parameterName?: string,
  ): unknown {
    return parameterName === undefined
      ? request.body
      : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        request.body[parameterName];
  }

  protected _getParams(request: Request, parameterName?: string): unknown {
    return parameterName === undefined
      ? request.params
      : request.params[parameterName];
  }

  protected _getQuery(request: Request, parameterName?: string): unknown {
    return parameterName === undefined
      ? request.query
      : request.query[parameterName];
  }

  protected _getHeaders(request: Request, parameterName?: string): unknown {
    return parameterName === undefined
      ? request.headers
      : request.headers[parameterName];
  }

  protected _getCookies(
    request: Request,
    _response: Response,
    parameterName?: string,
  ): unknown {
    return parameterName === undefined
      ? request.cookies
      : request.cookies[parameterName];
  }

  #buildDefaultExpressApp(customApp?: Application): Application {
    const app: Application = customApp ?? express();

    if (this.httpAdapterOptions.useCookies) {
      app.use(cookieParser());
    }

    if (this.httpAdapterOptions.useJson) {
      app.use(express.json());
    }

    return app;
  }
}
