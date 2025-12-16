import http from 'node:http';
import http2 from 'node:http2';
import { Readable } from 'node:stream';

import cookie, { FastifyCookieOptions } from '@fastify/cookie';
import fastifyFormbody from '@fastify/formbody';
import fastifyMultipart from '@fastify/multipart';
import {
  buildNormalizedPath,
  handleMiddlewareList,
  HttpStatusCode,
  InversifyHttpAdapter,
  MiddlewareHandler,
  RequestMethodParameterType,
  RequestMethodType,
  RouterParams,
} from '@inversifyjs/http-core';
import {
  fastify,
  FastifyInstance,
  FastifyPluginCallback,
  FastifyReply,
  FastifyRequest,
  RouteGenericInterface,
  RouteHandlerMethod,
} from 'fastify';
import { HttpHeader } from 'fastify/types/utils';
import { Container } from 'inversify';

import { FastifyHttpAdapterOptions } from '../models/FastifyHttpAdapterOptions';

const ADAPTER_ID: unique symbol = Symbol.for(
  '@inversifyjs/http-fastify/InversifyFastifyHttpAdapter',
);

type InversifyFastifyRequest = FastifyRequest<
  RouteGenericInterface,
  http.Server | http2.Http2Server,
  http.IncomingMessage | http2.Http2ServerRequest
>;

type InversifyFastifyReply = FastifyReply<
  RouteGenericInterface,
  http.Server | http2.Http2Server,
  http.IncomingMessage | http2.Http2ServerRequest,
  http.ServerResponse | http2.Http2ServerResponse
>;

export class InversifyFastifyHttpAdapter extends InversifyHttpAdapter<
  InversifyFastifyRequest,
  InversifyFastifyReply,
  () => void,
  void,
  FastifyHttpAdapterOptions,
  FastifyInstance
> {
  public readonly id: symbol = ADAPTER_ID;

  constructor(
    container: Container,
    httpAdapterOptions?: FastifyHttpAdapterOptions,
    customApp?: FastifyInstance,
  ) {
    super(
      container,
      {
        logger: true,
        useCookies: false,
        useFormUrlEncoded: false,
        useMultipartFormData: false,
      },
      httpAdapterOptions,
      [RequestMethodParameterType.Body],
      customApp,
    );
  }

  protected _buildApp(customApp: FastifyInstance | undefined): FastifyInstance {
    return customApp ?? this._buildDefaultFastifyApp();
  }

  protected _buildDefaultFastifyApp(
    customApp?: FastifyInstance,
  ): FastifyInstance {
    const app: FastifyInstance = customApp ?? fastify();

    if (this.httpAdapterOptions.useCookies) {
      app.register(
        cookie as unknown as FastifyPluginCallback<
          NonNullable<FastifyCookieOptions>
        >,
      );
    }

    if (this.httpAdapterOptions.useFormUrlEncoded) {
      app.register(fastifyFormbody);
    }

    if (this.httpAdapterOptions.useMultipartFormData !== false) {
      if (this.httpAdapterOptions.useMultipartFormData === true) {
        app.register(fastifyMultipart);
      } else {
        app.register(
          fastifyMultipart,
          this.httpAdapterOptions.useMultipartFormData,
        );
      }
    }

    return app;
  }

  protected _getBody(
    request: InversifyFastifyRequest,
    _response: InversifyFastifyReply,
    parameterName?: string,
  ): unknown {
    if (this.httpAdapterOptions.useMultipartFormData !== false) {
      return this.#getMultipartRequestBody(request, parameterName);
    } else {
      return this.#getRequestBody(request, parameterName);
    }
  }

  protected _getParams(
    request: InversifyFastifyRequest,
  ): Record<string, string>;
  protected _getParams(
    request: InversifyFastifyRequest,
    parameterName: string,
  ): string | undefined;
  protected _getParams(
    request: InversifyFastifyRequest,
    parameterName?: string,
  ): Record<string, string> | string | undefined {
    return parameterName === undefined
      ? (request.params as Record<string, string>)
      : (request.params as Record<string, string>)[parameterName];
  }
  protected _getQuery(
    request: InversifyFastifyRequest,
  ): Record<string, unknown>;
  protected _getQuery(
    request: InversifyFastifyRequest,
    parameterName: string,
  ): unknown;
  protected _getQuery(
    request: InversifyFastifyRequest,
    parameterName?: string,
  ): unknown {
    return parameterName === undefined
      ? request.query
      : (request.query as Record<string, unknown>)[parameterName];
  }

  protected _getHeaders(
    request: InversifyFastifyRequest,
  ): Record<string, string | string[] | undefined>;
  protected _getHeaders(
    request: InversifyFastifyRequest,
    parameterName: string,
  ): string | string[] | undefined;
  protected _getHeaders(
    request: InversifyFastifyRequest,
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
    request: InversifyFastifyRequest,
    _response: InversifyFastifyReply,
    parameterName?: string,
  ): unknown {
    return parameterName === undefined
      ? request.cookies
      : request.cookies[parameterName];
  }

  protected _replyText(
    _request: InversifyFastifyRequest,
    response: InversifyFastifyReply,
    value: string,
  ): void {
    response.send(value);
  }

  protected _replyJson(
    _request: InversifyFastifyRequest,
    response: InversifyFastifyReply,
    value?: object,
  ): void {
    response.send(value);
  }

  protected async _replyStream(
    _request: InversifyFastifyRequest,
    response: InversifyFastifyReply,
    value: Readable,
  ): Promise<void> {
    await response.send(value);
  }

  protected _sendBodySeparator(
    _request: InversifyFastifyRequest,
    response: InversifyFastifyReply,
  ): void {
    // Set headers and status code if not already set

    const responseHeaders: Record<
      HttpHeader,
      string | number | string[] | undefined
    > = response.getHeaders();

    if ('stream' in response.raw) {
      const headers: http2.OutgoingHttpHeaders = {
        ':status': response.statusCode,
      };

      for (const [headerKey, headerValue] of Object.entries(responseHeaders)) {
        if (headerValue !== undefined) {
          headers[headerKey] = headerValue;
        }
      }

      response.raw.stream.respond(headers, { endStream: false });
    } else {
      response.raw.statusCode = response.statusCode;

      for (const [headerKey, headerValue] of Object.entries(responseHeaders)) {
        if (headerValue !== undefined) {
          response.raw.setHeader(headerKey, headerValue);
        }
      }

      response.raw.flushHeaders();
    }
  }

  protected _setStatus(
    _request: InversifyFastifyRequest,
    response: InversifyFastifyReply,
    statusCode: HttpStatusCode,
  ): void {
    response.status(statusCode);
  }

  protected _setHeader(
    _request: InversifyFastifyRequest,
    response: InversifyFastifyReply,
    key: string,
    value: string,
  ): void {
    response.header(key, value);
  }

  protected _buildRouter(
    routerParams: RouterParams<
      InversifyFastifyRequest,
      InversifyFastifyReply,
      () => void,
      void
    >,
  ): void {
    for (const routeParams of routerParams.routeParamsList) {
      const orderedHandlers: MiddlewareHandler<
        InversifyFastifyRequest,
        InversifyFastifyReply,
        () => void,
        void
      >[] = [
        ...routeParams.preHandlerMiddlewareList,
        ...routeParams.guardList,
        routeParams.handler,
        ...routeParams.postHandlerMiddlewareList,
      ];

      const normalizedPath: string = buildNormalizedPath(
        `${routerParams.path}${routeParams.path}`,
      );

      const handleMiddlewares: (
        request: InversifyFastifyRequest,
        response: InversifyFastifyReply,
      ) => Promise<void> = handleMiddlewareList(orderedHandlers);

      const fastifyHandler: RouteHandlerMethod = async (
        request: InversifyFastifyRequest,
        reply: InversifyFastifyReply,
      ): Promise<void> => {
        await handleMiddlewares(request, reply);
      };

      this.#getAppRouteHandler(routeParams.requestMethodType)(
        normalizedPath,
        fastifyHandler,
      );
    }
  }

  #getAppRouteHandler(
    requestMethodType: RequestMethodType,
  ): (pattern: string, handler: RouteHandlerMethod) => FastifyInstance {
    switch (requestMethodType) {
      case RequestMethodType.All:
        return this._app.all.bind(this._app);
      case RequestMethodType.Delete:
        return this._app.delete.bind(this._app);
      case RequestMethodType.Get:
        return this._app.get.bind(this._app);
      case RequestMethodType.Head:
        return this._app.head.bind(this._app);
      case RequestMethodType.Options:
        return this._app.options.bind(this._app);
      case RequestMethodType.Patch:
        return this._app.patch.bind(this._app);
      case RequestMethodType.Post:
        return this._app.post.bind(this._app);
      case RequestMethodType.Put:
        return this._app.put.bind(this._app);
    }
  }

  #getMultipartRequestBody(
    request: InversifyFastifyRequest,
    parameterName: string | undefined,
  ): unknown {
    if (request.isMultipart()) {
      if (parameterName === undefined) {
        return request.parts();
      }

      throw new Error(
        'Cannot get multipart form data body with a specific parameter name.',
      );
    } else {
      return this.#getRequestBody(request, parameterName);
    }
  }

  #getRequestBody(
    request: InversifyFastifyRequest,
    parameterName: string | undefined,
  ): unknown {
    return parameterName === undefined
      ? request.body
      : (request.body as Record<string, unknown>)[parameterName];
  }
}
