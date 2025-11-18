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
  RouteHandlerMethod,
} from 'fastify';
import { Container } from 'inversify';

import { FastifyHttpAdapterOptions } from '../models/FastifyHttpAdapterOptions';

export class InversifyFastifyHttpAdapter extends InversifyHttpAdapter<
  FastifyRequest,
  FastifyReply,
  () => void,
  void,
  FastifyHttpAdapterOptions
> {
  readonly #app: FastifyInstance;

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
    );
    this.#app = this.#buildDefaultFastifyApp(customApp);
  }

  public async build(): Promise<FastifyInstance> {
    await this._buildServer();

    return this.#app;
  }

  protected _getBody(
    request: FastifyRequest,
    _response: FastifyReply,
    parameterName?: string,
  ): unknown {
    if (this.httpAdapterOptions.useMultipartFormData !== false) {
      return this.#getMultipartRequestBody(request, parameterName);
    } else {
      return this.#getRequestBody(request, parameterName);
    }
  }

  protected _getParams(request: FastifyRequest): Record<string, string>;
  protected _getParams(
    request: FastifyRequest,
    parameterName: string,
  ): string | undefined;
  protected _getParams(
    request: FastifyRequest,
    parameterName?: string,
  ): Record<string, string> | string | undefined {
    return parameterName === undefined
      ? (request.params as Record<string, string>)
      : (request.params as Record<string, string>)[parameterName];
  }
  protected _getQuery(request: FastifyRequest): Record<string, unknown>;
  protected _getQuery(request: FastifyRequest, parameterName: string): unknown;
  protected _getQuery(
    request: FastifyRequest,
    parameterName?: string,
  ): unknown {
    return parameterName === undefined
      ? request.query
      : (request.query as Record<string, unknown>)[parameterName];
  }

  protected _getHeaders(
    request: FastifyRequest,
  ): Record<string, string | string[] | undefined>;
  protected _getHeaders(
    request: FastifyRequest,
    parameterName: string,
  ): string | string[] | undefined;
  protected _getHeaders(
    request: FastifyRequest,
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
    request: FastifyRequest,
    _response: FastifyReply,
    parameterName?: string,
  ): unknown {
    return parameterName === undefined
      ? request.cookies
      : request.cookies[parameterName];
  }

  protected _replyText(
    _request: FastifyRequest,
    response: FastifyReply,
    value: string,
  ): void {
    response.send(value);
  }

  protected _replyJson(
    _request: FastifyRequest,
    response: FastifyReply,
    value?: object,
  ): void {
    response.send(value);
  }

  protected async _replyStream(
    _request: FastifyRequest,
    response: FastifyReply,
    value: Readable,
  ): Promise<void> {
    await response.send(value);
  }

  protected _setStatus(
    _request: FastifyRequest,
    response: FastifyReply,
    statusCode: HttpStatusCode,
  ): void {
    response.status(statusCode);
  }

  protected _setHeader(
    _request: FastifyRequest,
    response: FastifyReply,
    key: string,
    value: string,
  ): void {
    response.header(key, value);
  }

  protected _buildRouter(
    routerParams: RouterParams<FastifyRequest, FastifyReply, () => void, void>,
  ): void {
    for (const routeParams of routerParams.routeParamsList) {
      const orderedHandlers: MiddlewareHandler<
        FastifyRequest,
        FastifyReply,
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
        request: FastifyRequest,
        response: FastifyReply,
      ) => Promise<void> = handleMiddlewareList(orderedHandlers);

      const fastifyHandler: RouteHandlerMethod = async (
        request: FastifyRequest,
        reply: FastifyReply,
      ): Promise<void> => {
        await handleMiddlewares(request, reply);
      };

      this.#getAppRouteHandler(routeParams.requestMethodType)(
        normalizedPath,
        fastifyHandler,
      );
    }
  }

  #buildDefaultFastifyApp(customApp?: FastifyInstance): FastifyInstance {
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

  #getAppRouteHandler(
    requestMethodType: RequestMethodType,
  ): (pattern: string, handler: RouteHandlerMethod) => FastifyInstance {
    switch (requestMethodType) {
      case RequestMethodType.All:
        return this.#app.all.bind(this.#app);
      case RequestMethodType.Delete:
        return this.#app.delete.bind(this.#app);
      case RequestMethodType.Get:
        return this.#app.get.bind(this.#app);
      case RequestMethodType.Head:
        return this.#app.head.bind(this.#app);
      case RequestMethodType.Options:
        return this.#app.options.bind(this.#app);
      case RequestMethodType.Patch:
        return this.#app.patch.bind(this.#app);
      case RequestMethodType.Post:
        return this.#app.post.bind(this.#app);
      case RequestMethodType.Put:
        return this.#app.put.bind(this.#app);
    }
  }

  #getMultipartRequestBody(
    request: FastifyRequest,
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
    request: FastifyRequest,
    parameterName: string | undefined,
  ): unknown {
    return parameterName === undefined
      ? request.body
      : (request.body as Record<string, unknown>)[parameterName];
  }
}
