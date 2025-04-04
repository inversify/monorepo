import { Readable, Stream } from 'node:stream';

import {
  HttpAdapterOptions,
  HttpStatusCode,
  InversifyHttpAdapter,
  MiddlewareHandler,
  RequestHandler,
  RouterParams,
} from '@inversifyjs/http-core';
import {
  Context,
  Handler,
  Hono,
  HonoRequest,
  MiddlewareHandler as HonoMiddlewareHandler,
  Next,
} from 'hono';
import { getCookie } from 'hono/cookie';
import { stream } from 'hono/streaming';
import { StatusCode } from 'hono/utils/http-status';
import { StreamingApi } from 'hono/utils/stream';
import { Container } from 'inversify';

export class InversifyHonoHttpAdapter extends InversifyHttpAdapter<
  HonoRequest,
  Context,
  Next,
  Response | undefined
> {
  readonly #app: Hono;

  constructor(
    container: Container,
    httpAdapterOptions?: HttpAdapterOptions,
    customApp?: Hono,
  ) {
    super(container, httpAdapterOptions);
    this.#app = customApp ?? new Hono();
  }

  public async build(): Promise<Hono> {
    await this._buildServer();

    return this.#app;
  }

  protected _buildRouter(
    routerParams: RouterParams<
      HonoRequest,
      Context,
      Next,
      Response | undefined
    >,
  ): void {
    const router: Hono = new Hono();

    const routerHonoMiddlewareList: HonoMiddlewareHandler[] = [
      ...this.#buildHonoMiddlewareList(routerParams.guardList),
      ...this.#buildHonoMiddlewareList(routerParams.preHandlerMiddlewareList),
      ...this.#buildHonoPostHandlerMiddlewareList(
        routerParams.postHandlerMiddlewareList,
      ),
    ];

    if (routerHonoMiddlewareList.length > 0) {
      router.use(...routerHonoMiddlewareList);
    }

    for (const routeParams of routerParams.routeParamsList) {
      const routeHonoMiddlewareList: HonoMiddlewareHandler[] = [
        ...this.#buildHonoMiddlewareList(routeParams.guardList),
        ...this.#buildHonoMiddlewareList(routeParams.preHandlerMiddlewareList),
        ...this.#buildHonoPostHandlerMiddlewareList(
          routeParams.postHandlerMiddlewareList,
        ),
      ];

      router.use(routeParams.path, ...routeHonoMiddlewareList);
      router.on(
        this.#convertRequestMethodType(routeParams.requestMethodType),
        routeParams.path,
        this.#buildHonoHandler(routeParams.handler),
      );
    }

    this.#app.route(routerParams.path, router);
  }

  protected async _getBody(
    request: HonoRequest,
    parameterName?: string,
  ): Promise<unknown> {
    const body: Record<string, unknown> = await request.json();

    return parameterName !== undefined ? body[parameterName] : body;
  }

  protected _getParams(request: HonoRequest, parameterName?: string): unknown {
    return parameterName !== undefined
      ? request.param(parameterName)
      : request.param();
  }

  protected _getQuery(request: HonoRequest, parameterName?: string): unknown {
    return parameterName !== undefined
      ? request.query(parameterName)
      : request.query();
  }

  protected _getHeaders(request: HonoRequest, parameterName?: string): unknown {
    return parameterName !== undefined
      ? request.header(parameterName)
      : request.header();
  }

  protected _getCookies(
    _request: HonoRequest,
    response: Context,
    parameterName?: string,
  ): unknown {
    return parameterName !== undefined
      ? getCookie(response, parameterName)
      : getCookie(response);
  }

  protected _replyText(
    _request: HonoRequest,
    response: Context,
    value: string,
  ): Response {
    return response.text(value);
  }

  protected _replyJson(
    _request: HonoRequest,
    response: Context,
    value?: object,
  ): Response {
    return response.json(value);
  }

  protected _replyStream(
    _request: HonoRequest,
    response: Context,
    value: Stream,
  ): Response {
    return stream(response, async (stream: StreamingApi): Promise<void> => {
      await stream.pipe(Readable.toWeb(value));
    });
  }

  protected _setStatus(
    _request: HonoRequest,
    response: Context,
    statusCode: HttpStatusCode,
  ): void {
    response.status(statusCode as StatusCode);
  }

  protected _setHeader(
    _request: HonoRequest,
    response: Context,
    key: string,
    value: string,
  ): void {
    response.header(key, value);
  }

  #buildHonoHandler(
    handler: RequestHandler<HonoRequest, Context, Response | undefined>,
  ): Handler {
    return async (ctx: Context): Promise<Response | undefined> =>
      handler(ctx.req as HonoRequest, ctx);
  }

  #buildHonoMiddleware(
    handler: MiddlewareHandler<
      HonoRequest,
      Context,
      Next,
      Response | undefined
    >,
  ): HonoMiddlewareHandler {
    return async (
      ctx: Context,
      next: () => Promise<void>,
    ): Promise<Response | undefined> =>
      handler(ctx.req as HonoRequest, ctx, next);
  }

  #buildHonoMiddlewareList(
    handlers: MiddlewareHandler<
      HonoRequest,
      Context,
      Next,
      Response | undefined
    >[],
  ): HonoMiddlewareHandler[] {
    return handlers.map(
      (
        handler: MiddlewareHandler<
          HonoRequest,
          Context,
          Next,
          Response | undefined
        >,
      ) => this.#buildHonoMiddleware(handler),
    );
  }

  #buildHonoPostHandlerMiddleware(
    handler: MiddlewareHandler<
      HonoRequest,
      Context,
      Next,
      Response | undefined
    >,
  ): HonoMiddlewareHandler {
    return async (ctx: Context, next: Next): Promise<Response | undefined> => {
      await next();

      return handler(ctx.req as HonoRequest, ctx, next);
    };
  }

  #buildHonoPostHandlerMiddlewareList(
    handlers: MiddlewareHandler<
      HonoRequest,
      Context,
      Next,
      Response | undefined
    >[],
  ): HonoMiddlewareHandler[] {
    return handlers.map(
      (
        handler: MiddlewareHandler<
          HonoRequest,
          Context,
          Next,
          Response | undefined
        >,
      ) => this.#buildHonoPostHandlerMiddleware(handler),
    );
  }

  #convertRequestMethodType(requestMethodType: string): string {
    return requestMethodType.toUpperCase();
  }
}
