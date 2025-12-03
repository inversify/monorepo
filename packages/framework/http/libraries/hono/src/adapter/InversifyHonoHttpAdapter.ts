import http from 'node:http';
import http2 from 'node:http2';
import { Readable } from 'node:stream';

import { type Http2Bindings, type HttpBindings } from '@hono/node-server';
import {
  HttpAdapterOptions,
  HttpStatusCode,
  InversifyHttpAdapter,
  MiddlewareHandler,
  RequestHandler,
  RequestMethodParameterType,
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

const ADAPTER_ID: unique symbol = Symbol.for(
  '@inversifyjs/http-hono/InversifyHonoHttpAdapter',
);

export class InversifyHonoHttpAdapter extends InversifyHttpAdapter<
  HonoRequest,
  Context,
  Next,
  Response | undefined
> {
  public readonly id: symbol = ADAPTER_ID;

  readonly #app: Hono;

  constructor(
    container: Container,
    httpAdapterOptions?: HttpAdapterOptions,
    customApp?: Hono,
  ) {
    super(
      container,
      {
        logger: true,
      },
      httpAdapterOptions,
      [RequestMethodParameterType.Body],
    );
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

    for (const routeParams of routerParams.routeParamsList) {
      const routeHonoMiddlewareList: HonoMiddlewareHandler[] = [
        ...this.#buildHonoPreHandlerMiddlewareList(
          routeParams.preHandlerMiddlewareList,
        ),
        ...this.#buildHonoPreHandlerMiddlewareList(routeParams.guardList),
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
    _response: Context,
    parameterName?: string,
  ): Promise<unknown> {
    const contentType: string | undefined = this.#parseContentType(request);

    let body: unknown;

    switch (contentType) {
      case 'application/json':
        body = await request.json();
        break;
      case 'application/x-www-form-urlencoded':
        body = this.#parseUrlEncodedBody(await request.text());
        break;
      case 'multipart/form-data': {
        const formData: FormData = await request.formData();

        return parameterName === undefined
          ? formData
          : formData.get(parameterName);
      }
      default:
        body = await request.text();
    }

    return parameterName === undefined
      ? body
      : (body as Record<string, unknown>)[parameterName];
  }

  protected _getParams(request: HonoRequest): Record<string, string>;
  protected _getParams(
    request: HonoRequest,
    parameterName: string,
  ): string | undefined;
  protected _getParams(
    request: HonoRequest,
    parameterName?: string,
  ): Record<string, string> | string | undefined {
    return parameterName === undefined
      ? request.param()
      : request.param(parameterName);
  }

  protected _getQuery(request: HonoRequest): Record<string, unknown>;
  protected _getQuery(request: HonoRequest, parameterName: string): unknown;
  protected _getQuery(request: HonoRequest, parameterName?: string): unknown {
    return parameterName === undefined
      ? request.query()
      : request.query(parameterName);
  }

  protected _getHeaders(
    request: HonoRequest,
  ): Record<string, string | string[] | undefined>;
  protected _getHeaders(
    request: HonoRequest,
    parameterName: string,
  ): string | string[] | undefined;
  protected _getHeaders(
    request: HonoRequest,
    parameterName?: string,
  ):
    | Record<string, string | string[] | undefined>
    | string
    | string[]
    | undefined {
    return parameterName === undefined
      ? request.header()
      : request.header(parameterName);
  }

  protected _getCookies(
    _request: HonoRequest,
    response: Context,
    parameterName?: string,
  ): unknown {
    return parameterName === undefined
      ? getCookie(response)
      : getCookie(response, parameterName);
  }

  protected _replyText(
    _request: HonoRequest,
    response: Context,
    value: string,
  ): Response {
    return response.body(value);
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
    value: Readable,
  ): Response {
    return response.newResponse(Readable.toWeb(value));
  }

  protected _sendBodySeparator(_request: HonoRequest, response: Context): void {
    const rawResponse:
      | http.ServerResponse
      | http2.Http2ServerResponse
      | undefined = (
      response as Context<{ Bindings: Partial<HttpBindings | Http2Bindings> }>
    ).env.outgoing;

    if (rawResponse === undefined) {
      if (this.httpAdapterOptions.logger !== false) {
        this._logger.warn(
          'Unable to send body separator, raw response is not defined. Headers will be delivered with the first chunk of the body.',
        );
      }
    } else {
      // Hono does not understand it must not send headers again later, so we must not flush them here.
      // See https://github.com/honojs/hono/issues/4537

      // const statusCode: number = response.res.status;
      // const headers: Headers = response.res.headers;

      // rawResponse.statusCode = statusCode;
      // rawResponse.setHeaders(headers);

      // rawResponse.flushHeaders();

      if (this.httpAdapterOptions.logger !== false) {
        this._logger.warn(
          'Unable to send body separator, raw response is defined but hono is unable to prevent headers from being sent again.',
        );
      }
    }
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
    handler: RequestHandler<HonoRequest, Context, Next, Response | undefined>,
  ): Handler {
    return async (ctx: Context, next: Next): Promise<Response | undefined> =>
      handler(ctx.req as HonoRequest, ctx, next);
  }

  #buildHonoMiddleware(
    handler: MiddlewareHandler<
      HonoRequest,
      Context,
      Next,
      Response | undefined
    >,
  ): HonoMiddlewareHandler {
    return async (ctx: Context, next: Next): Promise<Response | undefined> =>
      handler(ctx.req as HonoRequest, ctx, next);
  }

  #buildHonoPreHandlerMiddlewareList(
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

  #parseContentType(request: HonoRequest): string | undefined {
    const contentTypeHeader: string | undefined =
      request.header('content-type');

    if (contentTypeHeader === undefined) {
      return undefined;
    }

    const [contentType]: string[] = contentTypeHeader.split(';');

    if (contentType === undefined) {
      return contentType;
    }

    const normalizedContentType: string = contentType.trim().toLowerCase();

    return normalizedContentType === '' ? undefined : normalizedContentType;
  }

  #parseUrlEncodedBody(
    stringifiedBody: string,
  ): Record<string, string | string[]> {
    const urlSearchParams: URLSearchParams = new URLSearchParams(
      stringifiedBody,
    );
    const parsedBody: Record<string, string | string[]> = {};

    urlSearchParams.forEach((value: string, key: string) => {
      if (parsedBody[key] === undefined) {
        parsedBody[key] = value;
      } else {
        if (Array.isArray(parsedBody[key])) {
          parsedBody[key].push(value);
        } else {
          parsedBody[key] = [parsedBody[key], value];
        }
      }
    });

    return parsedBody;
  }
}
