import {
  HttpAdapterOptions,
  HttpStatusCode,
  InversifyHttpAdapter,
  RequestHandler,
  RouterParams,
} from '@inversifyjs/http-core';
import {
  Context,
  Handler,
  Hono,
  HonoRequest,
  MiddlewareHandler,
  Next,
} from 'hono';
import { StatusCode } from 'hono/utils/http-status';
import { Container } from 'inversify';

export class InversifyHonoHttpAdapter extends InversifyHttpAdapter<
  HonoRequest,
  Context,
  Next
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
    routerParams: RouterParams<HonoRequest, Context, Next>,
  ): void {
    const router: Hono = new Hono();

    const routerHonoMiddlewareList: MiddlewareHandler[] = [
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
      const routeHonoMiddlewareList: MiddlewareHandler[] = [
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

  protected override async _getBody(
    request: HonoRequest,
    parameterName?: string,
  ): Promise<unknown> {
    const body: Record<string, unknown> = await request.json();

    return parameterName !== undefined ? body[parameterName] : body;
  }

  protected override _getParams(
    request: HonoRequest,
    parameterName?: string,
  ): unknown {
    return parameterName !== undefined
      ? request.param(parameterName)
      : request.param();
  }

  protected override _getQuery(
    request: HonoRequest,
    parameterName?: string,
  ): unknown {
    return parameterName !== undefined
      ? request.query(parameterName)
      : request.query();
  }

  protected override _getHeaders(
    request: HonoRequest,
    parameterName?: string,
  ): unknown {
    return parameterName !== undefined
      ? request.header(parameterName)
      : request.header();
  }

  protected override _getCookies(
    request: HonoRequest,
    parameterName?: string | symbol,
  ): unknown {
    return undefined;
  }

  protected override _replyText(
    _request: HonoRequest,
    response: Context,
    value: string,
  ): unknown {
    return response.text(value);
  }

  protected override _replyJson(
    _request: HonoRequest,
    response: Context,
    value?: object,
  ): unknown {
    return response.json(value);
  }

  protected override _setStatus(
    _request: HonoRequest,
    response: Context,
    statusCode: HttpStatusCode,
  ): void {
    response.status(statusCode as StatusCode);
  }

  #buildHonoHandler(
    handler: RequestHandler<HonoRequest, Context, Next>,
  ): Handler {
    return async (ctx: Context, next: Next): Promise<Response> => {
      return handler(ctx.req as HonoRequest, ctx, next) as Promise<Response>;
    };
  }

  #buildHonoMiddleware(
    handler: RequestHandler<HonoRequest, Context, Next>,
  ): MiddlewareHandler {
    return async (
      ctx: Context,
      next: () => Promise<void>,
    ): Promise<Response> => {
      return handler(ctx.req as HonoRequest, ctx, next) as Promise<Response>;
    };
  }

  #buildHonoMiddlewareList(
    handlers: RequestHandler<HonoRequest, Context, Next>[],
  ): MiddlewareHandler[] {
    return handlers.map((handler: RequestHandler<HonoRequest, Context, Next>) =>
      this.#buildHonoMiddleware(handler),
    );
  }

  #buildHonoPostHandlerMiddleware(
    handler: RequestHandler<HonoRequest, Context, Next>,
  ): MiddlewareHandler {
    return async (ctx: Context, next: Next): Promise<Response> => {
      await next();

      return handler(ctx.req as HonoRequest, ctx, next) as Promise<Response>;
    };
  }

  #buildHonoPostHandlerMiddlewareList(
    handlers: RequestHandler<HonoRequest, Context, Next>[],
  ): MiddlewareHandler[] {
    return handlers.map((handler: RequestHandler<HonoRequest, Context, Next>) =>
      this.#buildHonoPostHandlerMiddleware(handler),
    );
  }

  #convertRequestMethodType(requestMethodType: string): string {
    return requestMethodType.toUpperCase();
  }
}
