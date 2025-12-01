import { Readable } from 'node:stream';

import {
  buildNormalizedPath,
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
} from 'express';
import { Container } from 'inversify';

import { ExpressHttpAdapterOptions } from '../models/ExpressHttpAdapterOptions';

const ADAPTER_ID: unique symbol = Symbol.for(
  '@inversifyjs/http-express-v4/InversifyExpressHttpAdapter',
);

export class InversifyExpressHttpAdapter extends InversifyHttpAdapter<
  Request,
  Response,
  NextFunction,
  void,
  ExpressHttpAdapterOptions
> {
  public readonly id: symbol = ADAPTER_ID;

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
        useText: false,
        useUrlEncoded: false,
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

      const normalizedPath: string = buildNormalizedPath(
        `${routerParams.path}${routeParams.path}`,
      );

      this.#app[routeParams.requestMethodType](
        normalizedPath,
        ...(orderedPreHandlerMiddlewareList as ExpressRequestHandler[]),
        routeParams.handler as ExpressRequestHandler,
        ...(orderedPostHandlerMiddlewareList as ExpressRequestHandler[]),
      );
    }
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

  protected _sendBodySeparator(_request: Request, response: Response): void {
    response.flushHeaders();
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

  protected _getParams(request: express.Request): Record<string, string>;
  protected _getParams(
    request: express.Request,
    parameterName: string,
  ): string | undefined;
  protected _getParams(
    request: express.Request,
    parameterName?: string,
  ): Record<string, string> | string | undefined {
    return parameterName === undefined
      ? request.params
      : request.params[parameterName];
  }

  protected _getQuery(request: express.Request): Record<string, unknown>;
  protected _getQuery(request: express.Request, parameterName: string): unknown;
  protected _getQuery(
    request: express.Request,
    parameterName?: string,
  ): unknown {
    return parameterName === undefined
      ? request.query
      : request.query[parameterName];
  }

  protected _getHeaders(
    request: express.Request,
  ): Record<string, string | string[] | undefined>;
  protected _getHeaders(
    request: express.Request,
    parameterName: string,
  ): string | string[] | undefined;
  protected _getHeaders(
    request: express.Request,
    parameterName?: string,
  ):
    | Record<string, string | string[] | undefined>
    | string
    | string[]
    | undefined {
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
      app.use(express.json({ type: 'application/json' }));
    }

    if (this.httpAdapterOptions.useText) {
      app.use(express.text({ type: 'text/*' }));
    }

    if (this.httpAdapterOptions.useUrlEncoded) {
      app.use(
        express.urlencoded({
          extended: false,
          type: 'application/x-www-form-urlencoded',
        }),
      );
    }

    return app;
  }
}
