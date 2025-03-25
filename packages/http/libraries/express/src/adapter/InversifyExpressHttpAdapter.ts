import {
  HttpAdapterOptions,
  HttpStatusCode,
  InversifyHttpAdapter,
  RequestHandler,
  RouterParams,
} from '@inversifyjs/http-core';
import cors from 'cors';
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

    const orderedMiddlewareList: RequestHandler<
      Request,
      Response,
      NextFunction
    >[] = [...routerParams.guardList, ...routerParams.preHandlerMiddlewareList];

    if (orderedMiddlewareList.length > 0) {
      router.use(orderedMiddlewareList);
    }

    for (const routeParams of routerParams.routeParamsList) {
      const orderedPreHandlerMiddlewareList:
        | RequestHandler<Request, Response, NextFunction>[]
        | undefined = [
        ...routeParams.guardList,
        ...routeParams.preHandlerMiddlewareList,
      ];

      const orderedPostHandlerMiddlewareList:
        | RequestHandler<Request, Response, NextFunction>[]
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

  protected _setStatus(
    _request: Request,
    response: Response,
    statusCode: HttpStatusCode,
  ): void {
    response.status(statusCode);
  }

  protected async _getBody(
    request: Request,
    parameterName?: string,
  ): Promise<unknown> {
    return parameterName !== undefined
      ? (request.body as Record<string, unknown>)[parameterName]
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

  protected _getCookies(request: Request, parameterName?: string): unknown {
    return parameterName !== undefined
      ? (request.cookies as Record<string, unknown>)[parameterName]
      : request.cookies;
  }

  #buildDefaultExpressApp(customApp?: Application): Application {
    const app: Application = customApp ?? express();

    if (this.httpAdapterOptions.cors) {
      app.use(cors(this.corsOptions));
    }

    app.use(express.json());

    return app;
  }
}
