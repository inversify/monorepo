import {
  HttpAdapterOptions,
  HttpStatusCode,
  InversifyHttpAdapter,
  RouterParams,
} from '@inversifyjs/http-core';
import { Context, Hono, HonoRequest } from 'hono';
import { StatusCode } from 'hono/utils/http-status';
import { Container } from 'inversify';

export class InversifyHonoHttpAdapter extends InversifyHttpAdapter<
  HonoRequest,
  Context,
  () => Promise<unknown>
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
    path: string,
    routerParams: RouterParams<HonoRequest, Context, () => unknown>[],
  ): void {
    const router: Hono = new Hono();

    for (const routerParam of routerParams) {
      const method: keyof Hono = routerParam.requestMethodType as keyof Hono;
      (
        router[method] as unknown as (
          path: string,
          handler: (
            ctx: Context,
            next: () => Promise<void>,
          ) => Promise<Response>,
        ) => void
      )(
        routerParam.path,
        async (ctx: Context, next: () => Promise<void>): Promise<Response> =>
          routerParam.handler(
            ctx.req as HonoRequest,
            ctx,
            next,
          ) as Promise<Response>,
      );
    }

    this.#app.route(path, router);
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
}
