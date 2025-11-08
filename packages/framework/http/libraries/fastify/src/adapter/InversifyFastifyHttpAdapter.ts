import { Readable } from 'node:stream';

import cookie, { FastifyCookieOptions } from '@fastify/cookie';
import fastifyFormbody from '@fastify/formbody';
import fastifyMultipart from '@fastify/multipart';
import {
  HttpStatusCode,
  InversifyHttpAdapter,
  MiddlewareHandler,
  RequestHandler,
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
  HookHandlerDoneFunction,
  HTTPMethods,
  onResponseAsyncHookHandler,
  preHandlerAsyncHookHandler,
  RouteHandlerMethod,
} from 'fastify';
import { Container } from 'inversify';

import { FastifyHttpAdapterOptions } from '../models/FastifyHttpAdapterOptions';

export class InversifyFastifyHttpAdapter extends InversifyHttpAdapter<
  FastifyRequest,
  FastifyReply,
  HookHandlerDoneFunction,
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

  protected _getParams(
    request: FastifyRequest,
    parameterName?: string,
  ): unknown {
    return parameterName === undefined
      ? request.params
      : (request.params as Record<string, unknown>)[parameterName];
  }
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
    parameterName?: string,
  ): unknown {
    return parameterName === undefined
      ? request.headers
      : (request.headers as Record<string, unknown>)[parameterName];
  }

  protected _getCookies(
    request: FastifyRequest,
    _response: FastifyReply,
    parameterName?: string,
  ): unknown {
    return parameterName === undefined
      ? request.cookies
      : (request.cookies as Record<string, unknown>)[parameterName];
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
    routerParams: RouterParams<
      FastifyRequest,
      FastifyReply,
      HookHandlerDoneFunction,
      void
    >,
  ): void {
    const router: FastifyPluginCallback = (
      fastifyInstance: FastifyInstance,
      _opts: Record<string, unknown>,
      done: () => void,
    ) => {
      for (const routeParams of routerParams.routeParamsList) {
        const orderedMiddlewareList: MiddlewareHandler<
          FastifyRequest,
          FastifyReply,
          HookHandlerDoneFunction
        >[] = [
          ...routeParams.preHandlerMiddlewareList,
          ...routeParams.guardList,
        ];

        const normalizedUrl: string =
          routeParams.path === '/' ? '' : routeParams.path;

        fastifyInstance.route({
          handler: this.#buildFastifyHandler(routeParams.handler),
          method: this.#convertRequestMethodType(routeParams.requestMethodType),
          onResponse: this.#buildFastifyOnResponseAsyncMiddlewareList(
            routeParams.postHandlerMiddlewareList,
          ),
          preHandler: this.#buildFastifyPreHandlerAsyncMiddlewareList(
            orderedMiddlewareList,
          ),
          url: normalizedUrl,
        });
      }

      done();
    };

    this.#app.register(router, { prefix: routerParams.path });
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

  #buildFastifyHandler(
    handler: RequestHandler<
      FastifyRequest,
      FastifyReply,
      HookHandlerDoneFunction
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
          const done: HookHandlerDoneFunction = (err?: Error): void => {
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
      HookHandlerDoneFunction
    >[],
  ): preHandlerAsyncHookHandler[] {
    return middlewareList.map(
      (
        middleware: MiddlewareHandler<
          FastifyRequest,
          FastifyReply,
          HookHandlerDoneFunction
        >,
      ) => this.#buildFastifyPreHandlerAsyncMiddleware(middleware),
    );
  }

  #buildFastifyOnResponseAsyncMiddlewareList(
    middlewareList: MiddlewareHandler<
      FastifyRequest,
      FastifyReply,
      HookHandlerDoneFunction
    >[],
  ): onResponseAsyncHookHandler[] {
    return middlewareList.map(
      (
        middleware: MiddlewareHandler<
          FastifyRequest,
          FastifyReply,
          HookHandlerDoneFunction
        >,
      ) => this.#buildFastifyOnResponseAsyncMiddleware(middleware),
    );
  }

  #buildFastifyPreHandlerAsyncMiddleware(
    middleware: MiddlewareHandler<
      FastifyRequest,
      FastifyReply,
      HookHandlerDoneFunction
    >,
  ): preHandlerAsyncHookHandler {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      await new Promise(
        (
          resolve: (value?: unknown) => void,
          reject: (error?: unknown) => void,
        ) => {
          const done: HookHandlerDoneFunction = (err?: Error) => {
            if (err !== undefined) {
              reject(err);
            } else {
              resolve();
            }
          };

          middleware(request, reply, done);
        },
      );
    };
  }

  #buildFastifyOnResponseAsyncMiddleware(
    middleware: MiddlewareHandler<
      FastifyRequest,
      FastifyReply,
      HookHandlerDoneFunction
    >,
  ): onResponseAsyncHookHandler {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      await new Promise(
        (
          resolve: (value?: unknown) => void,
          reject: (error?: unknown) => void,
        ) => {
          const done: HookHandlerDoneFunction = (err?: Error) => {
            if (err !== undefined) {
              reject(err);
            } else {
              resolve();
            }
          };

          middleware(request, reply, done);
        },
      );
    };
  }

  #convertRequestMethodType(
    requestMethodType: RequestMethodType,
  ): HTTPMethods | HTTPMethods[] {
    return requestMethodType === RequestMethodType.All
      ? Object.values(RequestMethodType).filter(
          (method: RequestMethodType) => method !== RequestMethodType.All,
        )
      : requestMethodType;
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
