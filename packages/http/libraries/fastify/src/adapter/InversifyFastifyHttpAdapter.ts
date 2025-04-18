import { Readable } from 'node:stream';

import cookie, { FastifyCookieOptions } from '@fastify/cookie';
import {
  HttpAdapterOptions,
  HttpStatusCode,
  InversifyHttpAdapter,
  MiddlewareHandler,
  RequestHandler,
  RouterParams,
} from '@inversifyjs/http-core';
import {
  fastify,
  FastifyInstance,
  FastifyPluginCallback,
  FastifyReply,
  FastifyRequest,
  onResponseAsyncHookHandler,
  preHandlerAsyncHookHandler,
  RouteHandlerMethod,
} from 'fastify';
import { Container } from 'inversify';

export class InversifyFastifyHttpAdapter extends InversifyHttpAdapter<
  FastifyRequest,
  FastifyReply,
  (err?: unknown) => void,
  void
> {
  readonly #app: FastifyInstance;

  constructor(
    container: Container,
    httpAdapterOptions?: HttpAdapterOptions,
    customApp?: FastifyInstance,
  ) {
    super(container, httpAdapterOptions);
    this.#app = this.#buildDefaultFastifyApp(customApp);
  }

  public async build(): Promise<FastifyInstance> {
    await this._buildServer();

    return this.#app;
  }

  protected async _getBody(
    request: FastifyRequest,
    parameterName?: string,
  ): Promise<unknown> {
    return parameterName !== undefined
      ? (request.body as Record<string, unknown>)[parameterName]
      : request.body;
  }

  protected _getParams(
    request: FastifyRequest,
    parameterName?: string,
  ): unknown {
    return parameterName !== undefined
      ? (request.params as Record<string, unknown>)[parameterName]
      : request.params;
  }
  protected _getQuery(
    request: FastifyRequest,
    parameterName?: string,
  ): unknown {
    return parameterName !== undefined
      ? (request.query as Record<string, unknown>)[parameterName]
      : request.query;
  }

  protected _getHeaders(
    request: FastifyRequest,
    parameterName?: string,
  ): unknown {
    return parameterName !== undefined
      ? request.headers[parameterName]
      : request.headers;
  }

  protected _getCookies(
    request: FastifyRequest,
    _response: FastifyReply,
    parameterName?: string,
  ): unknown {
    return parameterName !== undefined
      ? request.cookies[parameterName]
      : request.cookies;
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

  protected _replyStream(
    _request: FastifyRequest,
    response: FastifyReply,
    value: Readable,
  ): void {
    response.send(value);
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
    routerParams: RouterParams<
      FastifyRequest,
      FastifyReply,
      (err?: Error) => void,
      void
    >,
  ): void {
    const router: FastifyPluginCallback = (
      fastifyInstance: FastifyInstance,
      _opts: Record<string, unknown>,
      done: () => void,
    ) => {
      const orderedMiddlewareList: MiddlewareHandler<
        FastifyRequest,
        FastifyReply,
        (err?: Error) => void
      >[] = [
        ...routerParams.guardList,
        ...routerParams.preHandlerMiddlewareList,
      ];

      for (const middleware of orderedMiddlewareList) {
        fastifyInstance.addHook(
          'preHandler',
          this.#buildFastifyPreHandlerAsyncMiddleware(middleware),
        );
      }

      for (const middleware of routerParams.postHandlerMiddlewareList) {
        fastifyInstance.addHook(
          'onResponse',
          this.#buildFastifyOnResponseAsyncMiddleware(middleware),
        );
      }

      for (const routeParams of routerParams.routeParamsList) {
        const orderedMiddlewareList: MiddlewareHandler<
          FastifyRequest,
          FastifyReply,
          (err?: Error) => void
        >[] = [
          ...routeParams.guardList,
          ...routeParams.preHandlerMiddlewareList,
        ];

        fastifyInstance.route({
          handler: this.#buildFastifyHandler(routeParams.handler),
          method: routeParams.requestMethodType,
          onResponse: this.#buildFastifyOnResponseAsyncMiddlewareList(
            routeParams.postHandlerMiddlewareList,
          ),
          preHandler: this.#buildFastifyPreHandlerAsyncMiddlewareList(
            orderedMiddlewareList,
          ),
          url: routeParams.path,
        });
      }

      done();
    };

    this.#app.register(router, { prefix: routerParams.path });
  }

  #buildDefaultFastifyApp(customApp?: FastifyInstance): FastifyInstance {
    const app: FastifyInstance = customApp ?? fastify();

    app.register(
      cookie as unknown as FastifyPluginCallback<
        NonNullable<FastifyCookieOptions>
      >,
    );

    return app;
  }

  #buildFastifyHandler(
    handler: RequestHandler<
      FastifyRequest,
      FastifyReply,
      (err?: Error) => void
    >,
  ): RouteHandlerMethod {
    return async (
      request: FastifyRequest,
      reply: FastifyReply,
    ): Promise<void> => {
      await new Promise(
        (
          resolve: (value?: unknown) => void,
          reject: (error?: unknown) => void,
        ) => {
          const done: (err?: Error) => void = (err?: Error) => {
            if (err !== undefined) {
              reject(err);
            } else {
              resolve();
            }
          };

          resolve(handler(request, reply, done));
        },
      );
    };
  }

  #buildFastifyPreHandlerAsyncMiddlewareList(
    middlewareList: MiddlewareHandler<
      FastifyRequest,
      FastifyReply,
      (err?: Error) => void
    >[],
  ): preHandlerAsyncHookHandler[] {
    return middlewareList.map(
      (
        middleware: MiddlewareHandler<
          FastifyRequest,
          FastifyReply,
          (err?: Error) => void
        >,
      ) => this.#buildFastifyPreHandlerAsyncMiddleware(middleware),
    );
  }

  #buildFastifyOnResponseAsyncMiddlewareList(
    middlewareList: MiddlewareHandler<
      FastifyRequest,
      FastifyReply,
      (err?: Error) => void
    >[],
  ): onResponseAsyncHookHandler[] {
    return middlewareList.map(
      (
        middleware: MiddlewareHandler<
          FastifyRequest,
          FastifyReply,
          (err?: Error) => void
        >,
      ) => this.#buildFastifyOnResponseAsyncMiddleware(middleware),
    );
  }

  #buildFastifyPreHandlerAsyncMiddleware(
    middleware: MiddlewareHandler<
      FastifyRequest,
      FastifyReply,
      (err?: Error) => void
    >,
  ): preHandlerAsyncHookHandler {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      await new Promise(
        (
          resolve: (value?: unknown) => void,
          reject: (error?: unknown) => void,
        ) => {
          const done: (err?: Error) => void = (err?: Error) => {
            if (err !== undefined) {
              reject(err);
            } else {
              resolve();
            }
          };

          resolve(middleware(request, reply, done));
        },
      );
    };
  }

  #buildFastifyOnResponseAsyncMiddleware(
    middleware: MiddlewareHandler<
      FastifyRequest,
      FastifyReply,
      (err?: Error) => void
    >,
  ): onResponseAsyncHookHandler {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      await new Promise(
        (
          resolve: (value?: unknown) => void,
          reject: (error?: unknown) => void,
        ) => {
          const done: (err?: Error) => void = (err?: Error) => {
            if (err !== undefined) {
              reject(err);
            } else {
              resolve();
            }
          };

          resolve(middleware(request, reply, done));
        },
      );
    };
  }
}
