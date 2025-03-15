import middie, { NextFunction, NextHandleFunction } from '@fastify/middie';
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
  RouteHandlerMethod,
} from 'fastify';
import { Container } from 'inversify';

export class InversifyFastifyHttpAdapter extends InversifyHttpAdapter<
  FastifyRequest,
  FastifyReply,
  NextFunction
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
    this.#app.register(middie, { hook: 'preHandler' });
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
    request: FastifyRequest,
    parameterName?: string | symbol,
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
    path: string,
    routerParams: RouterParams<FastifyRequest, FastifyReply, () => void>[],
    guardList:
      | RequestHandler<FastifyRequest, FastifyReply, () => void>[]
      | undefined,
    middlewareList:
      | RequestHandler<FastifyRequest, FastifyReply, () => void>[]
      | undefined,
  ): void {
    const router: FastifyPluginCallback = (
      fastifyInstance: FastifyInstance,
      _opts: Record<string, unknown>,
      done: (err?: Error) => void,
    ) => {
      const orderedMiddlewareList:
        | RequestHandler<FastifyRequest, FastifyReply, () => void>[]
        | undefined = this.#orderMiddlewares(guardList, middlewareList);

      if (orderedMiddlewareList !== undefined) {
        for (const middleware of orderedMiddlewareList) {
          fastifyInstance.use(middleware as unknown as NextHandleFunction);
        }
      }

      for (const routerParam of routerParams) {
        fastifyInstance.route({
          handler: routerParam.handler as RouteHandlerMethod,
          method: routerParam.requestMethodType,
          url: routerParam.path,
        });

        const orderedMiddlewareList:
          | RequestHandler<FastifyRequest, FastifyReply, () => void>[]
          | undefined = this.#orderMiddlewares(
          routerParam.guardList,
          routerParam.middlewareList,
        );

        if (orderedMiddlewareList !== undefined) {
          for (const middleware of orderedMiddlewareList) {
            fastifyInstance.use(
              routerParam.path,
              middleware as unknown as NextHandleFunction,
            );
          }
        }
      }

      done();
    };

    this.#app.register(router, { prefix: path });
  }

  #orderMiddlewares(
    guardList:
      | RequestHandler<FastifyRequest, FastifyReply, () => void>[]
      | undefined,
    middlewareList:
      | RequestHandler<FastifyRequest, FastifyReply, () => void>[]
      | undefined,
  ): RequestHandler<FastifyRequest, FastifyReply, () => void>[] | undefined {
    let orderedMiddlewareList:
      | RequestHandler<FastifyRequest, FastifyReply, () => void>[]
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
