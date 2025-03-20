import {
  HttpAdapterOptions,
  HttpStatusCode,
  InversifyHttpAdapter,
  RequestHandler,
  RouterParams,
} from '@inversifyjs/http-core';
import {
  fastify,
  FastifyInstance,
  FastifyPluginCallback,
  FastifyReply,
  FastifyRequest,
  preHandlerAsyncHookHandler,
  preHandlerHookHandler,
  RouteHandlerMethod,
} from 'fastify';
import { Container } from 'inversify';

export class InversifyFastifyHttpAdapter extends InversifyHttpAdapter<
  FastifyRequest,
  FastifyReply,
  (err?: Error) => void
> {
  readonly #app: FastifyInstance;

  constructor(
    container: Container,
    httpAdapterOptions?: HttpAdapterOptions,
    customApp?: FastifyInstance,
  ) {
    super(container, httpAdapterOptions);
    this.#app = customApp ?? fastify();
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

  protected override _getParams(
    request: FastifyRequest,
    parameterName?: string,
  ): unknown {
    return parameterName !== undefined
      ? (request.params as Record<string, unknown>)[parameterName]
      : request.params;
  }
  protected override _getQuery(
    request: FastifyRequest,
    parameterName?: string,
  ): unknown {
    return parameterName !== undefined
      ? (request.query as Record<string, unknown>)[parameterName]
      : request.query;
  }

  protected override _getHeaders(
    request: FastifyRequest,
    parameterName?: string,
  ): unknown {
    return parameterName !== undefined
      ? request.headers[parameterName]
      : request.headers;
  }

  protected override _getCookies(
    _request: FastifyRequest,
    _parameterName?: string | symbol,
  ): unknown {
    return undefined;
  }

  protected override _replyText(
    _request: FastifyRequest,
    response: FastifyReply,
    value: string,
  ): unknown {
    return response.send(value);
  }

  protected override _replyJson(
    _request: FastifyRequest,
    response: FastifyReply,
    value?: object,
  ): unknown {
    return response.send(value);
  }

  protected override _setStatus(
    _request: FastifyRequest,
    response: FastifyReply,
    statusCode: HttpStatusCode,
  ): void {
    response.status(statusCode);
  }

  protected override _buildRouter(
    routerParams: RouterParams<
      FastifyRequest,
      FastifyReply,
      (err?: Error) => void
    >,
  ): void {
    const router: FastifyPluginCallback = (
      fastifyInstance: FastifyInstance,
      _opts: Record<string, unknown>,
      done: () => void,
    ) => {
      const orderedMiddlewareList: RequestHandler<
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
          this.#buildFastifySyncMiddleware(middleware),
        );
      }

      for (const middleware of routerParams.postHandlerMiddlewareList) {
        fastifyInstance.addHook(
          'onResponse',
          this.#buildFastifySyncMiddleware(middleware),
        );
      }

      for (const routeParams of routerParams.routeParamsList) {
        const orderedMiddlewareList: RequestHandler<
          FastifyRequest,
          FastifyReply,
          (err?: Error) => void
        >[] = [
          ...routeParams.guardList,
          ...routeParams.preHandlerMiddlewareList,
        ];

        fastifyInstance.route({
          handler: routeParams.handler as RouteHandlerMethod,
          method: routeParams.requestMethodType,
          onResponse: this.#buildFastifySyncMiddlewareList(
            routeParams.postHandlerMiddlewareList,
          ),
          preHandler: this.#buildFastifySyncMiddlewareList(
            orderedMiddlewareList,
          ),
          url: routeParams.path,
        });
      }

      done();
    };

    this.#app.register(router, { prefix: routerParams.path });
  }

  #buildFastifySyncMiddlewareList(
    middlewareList: RequestHandler<
      FastifyRequest,
      FastifyReply,
      (err?: Error) => void
    >[],
  ): preHandlerHookHandler[] {
    return middlewareList.map(
      (
        middleware: RequestHandler<
          FastifyRequest,
          FastifyReply,
          (err?: Error) => void
        >,
      ) => this.#buildFastifySyncMiddleware(middleware),
    );
  }

  #buildFastifySyncMiddleware(
    middleware: RequestHandler<
      FastifyRequest,
      FastifyReply,
      (err?: Error) => void
    >,
  ): preHandlerAsyncHookHandler {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      return new Promise(
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

          void Promise.resolve(middleware(request, reply, done));
        },
      );
    };
  }
}
