import {
  HttpAdapterOptions,
  HttpStatusCode,
  InversifyHttpAdapter,
  RequestHandler,
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
  NextFunction
> {
  readonly #app: Application;

  constructor(
    container: Container,
    httpAdapterOptions?: HttpAdapterOptions,
    customApp?: Application,
  ) {
    super(container, httpAdapterOptions);
    this.#app = customApp ?? express();
  }

  public async build(): Promise<Application> {
    this.#app.use(express.json());

    await this._buildServer();

    return this.#app;
  }

  protected override _buildRouter(
    path: string,
    routerParams: RouterParams<Request, Response, NextFunction>[],
    middlewareList:
      | RequestHandler<Request, Response, NextFunction>[]
      | undefined,
    guardList: RequestHandler<Request, Response, NextFunction>[] | undefined,
  ): void {
    const router: Router = Router();

    const orderedMiddlewareList:
      | RequestHandler<Request, Response, NextFunction>[]
      | undefined = this.#orderMiddlewares(guardList, middlewareList);

    if (orderedMiddlewareList !== undefined) {
      router.use(orderedMiddlewareList);
    }

    for (const route of routerParams) {
      const orderedMiddlewareList:
        | RequestHandler<Request, Response, NextFunction>[]
        | undefined = this.#orderMiddlewares(
        route.guardList,
        route.middlewareList,
      );

      if (orderedMiddlewareList !== undefined) {
        router[route.requestMethodType](
          route.path,
          ...(orderedMiddlewareList as ExpressRequestHandler[]),
          route.handler as ExpressRequestHandler,
        );
      } else {
        router[route.requestMethodType](
          route.path,
          route.handler as ExpressRequestHandler,
        );
      }
    }

    this.#app.use(path, router);
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

  #orderMiddlewares(
    guardList: RequestHandler<Request, Response, NextFunction>[] | undefined,
    middlewareList:
      | RequestHandler<Request, Response, NextFunction>[]
      | undefined,
  ): RequestHandler<Request, Response, NextFunction>[] | undefined {
    let orderedMiddlewareList:
      | RequestHandler<Request, Response, NextFunction>[]
      | undefined = undefined;

    if (guardList !== undefined || middlewareList !== undefined) {
      orderedMiddlewareList = [];

      if (guardList !== undefined) {
        orderedMiddlewareList.push(...guardList);
      }

      if (middlewareList !== undefined) {
        orderedMiddlewareList.push(...middlewareList);
      }
    }

    return orderedMiddlewareList;
  }
}
