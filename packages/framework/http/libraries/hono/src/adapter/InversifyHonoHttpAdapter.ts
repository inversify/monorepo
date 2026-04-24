import type http from 'node:http';
import type http2 from 'node:http2';
import { Readable } from 'node:stream';

import { type Http2Bindings, type HttpBindings } from '@hono/node-server';
import {
  type HttpAdapterOptions,
  type HttpStatusCode,
  InversifyHttpAdapter,
  type MiddlewareHandler,
  type RequestHandler,
  RequestMethodParameterType,
  type RouterParams,
  routeValueMetadataSymbol,
} from '@inversifyjs/http-core';
import {
  type Context,
  type Handler,
  Hono,
  type HonoRequest,
  type MiddlewareHandler as HonoMiddlewareHandler,
  type Next,
} from 'hono';
import { getCookie } from 'hono/cookie';
import { type StatusCode } from 'hono/utils/http-status';
import { type Container } from 'inversify';

const ADAPTER_ID: unique symbol = Symbol.for(
  '@inversifyjs/http-hono/InversifyHonoHttpAdapter',
);

export class InversifyHonoHttpAdapter extends InversifyHttpAdapter<
  HonoRequest,
  Context,
  Next,
  Response | undefined,
  HttpAdapterOptions,
  Hono
> {
  public readonly id: symbol = ADAPTER_ID;

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
      customApp,
    );
  }

  protected _buildApp(customApp: Hono | undefined): Hono {
    return customApp ?? new Hono();
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

      const httpMethod: string = this.#convertRequestMethodType(
        routeParams.requestMethodType,
      );

      for (const routeHonoMiddleware of routeHonoMiddlewareList) {
        router.on(httpMethod, routeParams.path, routeHonoMiddleware);
      }

      router.on(
        httpMethod,
        routeParams.path,
        this.#buildHonoHandler(routeParams.handler),
      );
    }

    this._app.route(routerParams.path, router);
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

  protected _getMethod(request: HonoRequest): string {
    return request.method;
  }

  protected _getUrl(request: HonoRequest): string {
    const url: URL = new URL(request.url);

    return url.pathname + url.search;
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
      ? this.#parseQueriesRecord(request)
      : this.#parseQueriesParam(request, parameterName);
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

  protected override _getRouteValueMetadataHandler(
    routeValueMetadataMap: Map<string | symbol, unknown>,
  ):
    | MiddlewareHandler<HonoRequest, Context, Next, Response | undefined>
    | undefined {
    if (routeValueMetadataMap.size === 0) {
      return undefined;
    }

    return async (
      request: HonoRequest,
      _context: Context,
      next: Next,
    ): Promise<Response | undefined> => {
      (
        request as HonoRequest & {
          [routeValueMetadataSymbol]?: Map<string | symbol, unknown>;
        }
      )[routeValueMetadataSymbol] = routeValueMetadataMap;

      await next();

      return undefined;
    };
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

  #parseQueriesRecord(request: HonoRequest): Record<string, string | string[]> {
    const queries: Record<string, string | string[]> = request.queries();

    for (const [key, value] of Object.entries(queries)) {
      if ((value as string[]).length === 1) {
        queries[key] = (value as [string])[0];
      }
    }

    return queries;
  }

  #parseQueriesParam(
    request: HonoRequest,
    paramName: string,
  ): string | string[] | undefined {
    const query: string[] | undefined = request.queries(paramName);

    if (query === undefined) {
      return undefined;
    }

    if (query.length === 1) {
      return query[0];
    }

    return query;
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
