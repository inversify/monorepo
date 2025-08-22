import { Readable } from 'node:stream';

import {
  ApplyMiddlewareOptions,
  buildMiddlewareOptionsFromApplyMiddlewareOptions,
  ErrorResponse,
  ForbiddenResponse,
  Guard,
  InternalServerErrorResponse,
  isPipe,
  isResponse,
  Middleware,
  MiddlewareOptions,
  Pipe,
  PipeMetadata,
  Response,
  StatusCode,
} from '@inversifyjs/framework-core';
import { ConsoleLogger, Logger } from '@inversifyjs/logger';
import { Container, Newable } from 'inversify';

import { InversifyHttpAdapterError } from '../../error/models/InversifyHttpAdapterError';
import { InversifyHttpAdapterErrorKind } from '../../error/models/InversifyHttpAdapterErrorKind';
import { buildRouterExplorerControllerMetadataList } from '../../routerExplorer/calculations/buildRouterExplorerControllerMetadataList';
import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { RouterExplorerControllerMetadata } from '../../routerExplorer/model/RouterExplorerControllerMetadata';
import { RouterExplorerControllerMethodMetadata } from '../../routerExplorer/model/RouterExplorerControllerMethodMetadata';
import { Controller } from '../models/Controller';
import { ControllerResponse } from '../models/ControllerResponse';
import { HttpAdapterOptions } from '../models/HttpAdapterOptions';
import { MiddlewareHandler } from '../models/MiddlewareHandler';
import { RequestHandler } from '../models/RequestHandler';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { RequiredOptions } from '../models/RequiredOptions';
import { RouteParams } from '../models/RouteParams';
import { RouterParams } from '../models/RouterParams';

const DEFAULT_ERROR_MESSAGE: string = 'An unexpected error occurred';

export abstract class InversifyHttpAdapter<
  TRequest,
  TResponse,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TNextFunction extends (err?: any) => Promise<void> | void,
  TResult,
  TOptions extends HttpAdapterOptions = HttpAdapterOptions,
> {
  protected readonly httpAdapterOptions: RequiredOptions<TOptions>;
  protected readonly globalHandlers: {
    preHandlerMiddlewareList: MiddlewareHandler<
      TRequest,
      TResponse,
      TNextFunction,
      TResult
    >[];
    postHandlerMiddlewareList: MiddlewareHandler<
      TRequest,
      TResponse,
      TNextFunction,
      TResult
    >[];
    guardList: MiddlewareHandler<
      TRequest,
      TResponse,
      TNextFunction,
      TResult | undefined
    >[];
  };
  readonly #awaitableRequestMethodParamTypes: Set<RequestMethodParameterType>;
  readonly #container: Container;
  readonly #logger: Logger;
  readonly #globalPipeList: (Newable<Pipe> | Pipe)[];
  #isBuilt: boolean;

  constructor(
    container: Container,
    defaultHttpAdapterOptions: RequiredOptions<TOptions>,
    httpAdapterOptions: TOptions | undefined,
    awaitableRequestMethodParamTypes?:
      | Iterable<RequestMethodParameterType>
      | undefined,
  ) {
    this.#awaitableRequestMethodParamTypes = new Set(
      awaitableRequestMethodParamTypes,
    );
    this.#container = container;
    this.httpAdapterOptions = this.#parseHttpAdapterOptions(
      defaultHttpAdapterOptions,
      httpAdapterOptions,
    );
    this.#logger = this.#buildLogger(this.httpAdapterOptions);
    this.#globalPipeList = [];
    this.#isBuilt = false;
    this.globalHandlers = {
      guardList: [],
      postHandlerMiddlewareList: [],
      preHandlerMiddlewareList: [],
    };
  }

  public applyGlobalMiddleware(
    ...middlewareList: (Newable<Middleware> | ApplyMiddlewareOptions)[]
  ): void {
    if (this.#isBuilt) {
      throw new InversifyHttpAdapterError(
        InversifyHttpAdapterErrorKind.invalidOperationAfterBuild,
        'Cannot apply global middleware after the server has been built',
      );
    }

    const middlewareOptions: MiddlewareOptions =
      buildMiddlewareOptionsFromApplyMiddlewareOptions(middlewareList);

    const preHandlerMiddlewareList: MiddlewareHandler<
      TRequest,
      TResponse,
      TNextFunction,
      TResult
    >[] = this.#getMiddlewareHandlerFromMetadata(
      middlewareOptions.preHandlerMiddlewareList,
    );

    const postHandlerMiddlewareList: MiddlewareHandler<
      TRequest,
      TResponse,
      TNextFunction,
      TResult
    >[] = this.#getMiddlewareHandlerFromMetadata(
      middlewareOptions.postHandlerMiddlewareList,
    );

    this.globalHandlers.preHandlerMiddlewareList.push(
      ...preHandlerMiddlewareList,
    );
    this.globalHandlers.postHandlerMiddlewareList.push(
      ...postHandlerMiddlewareList,
    );
  }

  public applyGlobalGuards(...guardList: Newable<Guard<TRequest>>[]): void {
    if (this.#isBuilt) {
      throw new InversifyHttpAdapterError(
        InversifyHttpAdapterErrorKind.invalidOperationAfterBuild,
        'Cannot apply global guard after the server has been built',
      );
    }

    const guardHandlerList: MiddlewareHandler<
      TRequest,
      TResponse,
      TNextFunction,
      TResult | undefined
    >[] = this.#getGuardHandlerFromMetadata(guardList);

    this.globalHandlers.guardList.push(...guardHandlerList);
  }

  public useGlobalPipe(...pipeList: (Newable<Pipe> | Pipe)[]): void {
    this.#globalPipeList.push(...pipeList);
  }

  protected async _buildServer(): Promise<void> {
    await this.#registerControllers();

    this.#isBuilt = true;
  }

  async #appendHandlerParam(
    params: unknown[],
    index: number,
    param: unknown,
    type: RequestMethodParameterType,
  ): Promise<void> {
    params[index] = this.#awaitableRequestMethodParamTypes.has(type)
      ? await param
      : param;
  }

  #buildLogger(httpAdapterOptions: RequiredOptions<TOptions>): Logger {
    if (typeof httpAdapterOptions.logger === 'boolean') {
      return new ConsoleLogger();
    }

    return httpAdapterOptions.logger;
  }

  #parseHttpAdapterOptions(
    defaultHttpAdapterOptions: RequiredOptions<TOptions>,
    httpAdapterOptions: TOptions | undefined,
  ): RequiredOptions<TOptions> {
    return {
      ...defaultHttpAdapterOptions,
      ...httpAdapterOptions,
    };
  }

  async #registerControllers(): Promise<void> {
    const routerExplorerControllerMetadataList: RouterExplorerControllerMetadata<
      TRequest,
      TResponse,
      TResult
    >[] = buildRouterExplorerControllerMetadataList(this.#container);

    for (const routerExplorerControllerMetadata of routerExplorerControllerMetadataList) {
      await this._buildRouter({
        guardList: this.#getGuardHandlerFromMetadata(
          routerExplorerControllerMetadata.guardList,
        ),
        path: routerExplorerControllerMetadata.path,
        postHandlerMiddlewareList: this.#getMiddlewareHandlerFromMetadata(
          routerExplorerControllerMetadata.postHandlerMiddlewareList,
        ),
        preHandlerMiddlewareList: this.#getMiddlewareHandlerFromMetadata(
          routerExplorerControllerMetadata.preHandlerMiddlewareList,
        ),
        routeParamsList: this.#buildHandlers(
          routerExplorerControllerMetadata.target,
          routerExplorerControllerMetadata.controllerMethodMetadataList,
        ),
      });

      if (this.httpAdapterOptions.logger !== false) {
        this.#printController(
          routerExplorerControllerMetadata.target.name,
          routerExplorerControllerMetadata.path,
          routerExplorerControllerMetadata.controllerMethodMetadataList,
        );
      }
    }
  }

  #buildHandlers(
    target: NewableFunction,
    routerExplorerControllerMethodMetadata: RouterExplorerControllerMethodMetadata<
      TRequest,
      TResponse,
      unknown
    >[],
  ): RouteParams<TRequest, TResponse, TNextFunction, TResult>[] {
    return routerExplorerControllerMethodMetadata.map(
      (
        routerExplorerControllerMethodMetadata: RouterExplorerControllerMethodMetadata<
          TRequest,
          TResponse,
          unknown
        >,
      ) => ({
        guardList: this.#getGuardHandlerFromMetadata(
          routerExplorerControllerMethodMetadata.guardList,
        ),
        handler: this.#buildHandler(
          target,
          routerExplorerControllerMethodMetadata,
        ),
        path: routerExplorerControllerMethodMetadata.path,
        postHandlerMiddlewareList: this.#getMiddlewareHandlerFromMetadata(
          routerExplorerControllerMethodMetadata.postHandlerMiddlewareList,
        ),
        preHandlerMiddlewareList: this.#getMiddlewareHandlerFromMetadata(
          routerExplorerControllerMethodMetadata.preHandlerMiddlewareList,
        ),
        requestMethodType:
          routerExplorerControllerMethodMetadata.requestMethodType,
      }),
    );
  }

  #buildHandler(
    targetClass: NewableFunction,
    routerExplorerControllerMethodMetadata: RouterExplorerControllerMethodMetadata<
      TRequest,
      TResponse,
      unknown
    >,
  ): RequestHandler<TRequest, TResponse, TNextFunction, TResult> {
    const buildHandlerParams: (
      request: TRequest,
      response: TResponse,
      next: TNextFunction,
    ) => Promise<unknown[]> = this.#buildHandlerParams(
      targetClass,
      routerExplorerControllerMethodMetadata.methodKey,
      routerExplorerControllerMethodMetadata.parameterMetadataList,
    );

    let reply: (
      req: TRequest,
      res: TResponse,
      value: ControllerResponse,
    ) => TResult;

    if (routerExplorerControllerMethodMetadata.useNativeHandler) {
      reply = (_req: TRequest, _res: TResponse, value: ControllerResponse) =>
        value as TResult;
    } else {
      reply = (req: TRequest, res: TResponse, value: ControllerResponse) =>
        this.#reply(
          req,
          res,
          value,
          routerExplorerControllerMethodMetadata.statusCode,
        );
    }

    return async (
      req: TRequest,
      res: TResponse,
      next: TNextFunction,
    ): Promise<TResult> => {
      try {
        const controller: Controller =
          await this.#container.getAsync(targetClass);

        const handlerParams: unknown[] = await buildHandlerParams(
          req,
          res,
          next,
        );

        this.#setHeaders(
          req,
          res,
          routerExplorerControllerMethodMetadata.headerMetadataList,
        );

        const value: ControllerResponse = await controller[
          routerExplorerControllerMethodMetadata.methodKey
        ]?.(...handlerParams);

        return reply(req, res, value);
      } catch (error: unknown) {
        return this.#handleError(req, res, error);
      }
    };
  }

  #buildHandlerParams(
    targetClass: NewableFunction,
    controllerMethodKey: string | symbol,
    controllerMethodParameterMetadataList: (
      | ControllerMethodParameterMetadata<TRequest, TResponse, unknown>
      | undefined
    )[],
  ): (
    request: TRequest,
    response: TResponse,
    next: TNextFunction,
  ) => Promise<unknown[]> {
    const paramBuilders: (
      | ((
          request: TRequest,
          response: TResponse,
          next: TNextFunction,
        ) => unknown)
      | undefined
    )[] = controllerMethodParameterMetadataList.map(
      (
        controllerMethodParameterMetadata:
          | ControllerMethodParameterMetadata<TRequest, TResponse, unknown>
          | undefined,
      ) => {
        if (controllerMethodParameterMetadata === undefined) {
          return undefined;
        }

        switch (controllerMethodParameterMetadata.parameterType) {
          case RequestMethodParameterType.Body:
            return (request: TRequest): unknown =>
              this._getBody(
                request,
                controllerMethodParameterMetadata.parameterName,
              );
          case RequestMethodParameterType.Cookies:
            return (request: TRequest, response: TResponse): unknown =>
              this._getCookies(
                request,
                response,
                controllerMethodParameterMetadata.parameterName,
              );
          case RequestMethodParameterType.Custom:
            return (request: TRequest, response: TResponse): unknown =>
              controllerMethodParameterMetadata.customParameterDecoratorHandler?.(
                request,
                response,
              );
          case RequestMethodParameterType.Headers:
            return (request: TRequest): unknown =>
              this._getHeaders(
                request,
                controllerMethodParameterMetadata.parameterName,
              );
          case RequestMethodParameterType.Next:
            return (
              _request: TRequest,
              _response: TResponse,
              next: TNextFunction,
            ): unknown => next;
          case RequestMethodParameterType.Params:
            return (request: TRequest): unknown =>
              this._getParams(
                request,
                controllerMethodParameterMetadata.parameterName,
              );
          case RequestMethodParameterType.Query:
            return (request: TRequest): unknown =>
              this._getQuery(
                request,
                controllerMethodParameterMetadata.parameterName,
              );
          case RequestMethodParameterType.Request:
            return (request: TRequest): unknown => request;
          case RequestMethodParameterType.Response:
            return (_request: TRequest, response: TResponse): unknown =>
              response;
        }
      },
    );

    return async (
      request: TRequest,
      response: TResponse,
      next: TNextFunction,
    ): Promise<unknown[]> => {
      const params: unknown[] = new Array(
        controllerMethodParameterMetadataList.length,
      );

      await Promise.all(
        (
          paramBuilders as ((
            request: TRequest,
            response: TResponse,
            next: TNextFunction,
          ) => unknown)[]
        ).map(
          async (
            paramBuilder: (
              request: TRequest,
              response: TResponse,
              next: TNextFunction,
            ) => unknown,
            index: number,
          ): Promise<void> => {
            const controllerMethodParameterMetadata: ControllerMethodParameterMetadata<
              TRequest,
              TResponse,
              unknown
            > = controllerMethodParameterMetadataList[
              index
            ] as ControllerMethodParameterMetadata<
              TRequest,
              TResponse,
              unknown
            >;

            await this.#appendHandlerParam(
              params,
              index,
              paramBuilder(request, response, next),
              controllerMethodParameterMetadata.parameterType,
            );

            await this.#applyPipeList(
              params,
              [
                ...this.#globalPipeList,
                ...controllerMethodParameterMetadata.pipeList,
              ],
              {
                methodName: controllerMethodKey,
                parameterIndex: index,
                targetClass,
              },
            );
          },
        ),
      );

      return params;
    };
  }

  async #applyPipeList(
    params: unknown[],
    pipeList: (Newable<Pipe> | Pipe)[],
    pipeMetadata: PipeMetadata,
  ): Promise<void> {
    for (const pipeOrNewable of pipeList) {
      const pipe: Pipe = isPipe(pipeOrNewable)
        ? pipeOrNewable
        : await this.#container.getAsync(pipeOrNewable);

      params[pipeMetadata.parameterIndex] = await pipe.execute(
        params[pipeMetadata.parameterIndex],
        pipeMetadata,
      );
    }
  }

  #handleError(
    request: TRequest,
    response: TResponse,
    error: unknown,
  ): TResult {
    let httpResponse: Response | undefined = undefined;

    if (ErrorResponse.is(error)) {
      httpResponse = error;
    } else {
      this.#printError(error);

      httpResponse = new InternalServerErrorResponse(undefined, undefined, {
        cause: error,
      });
    }

    return this.#reply(request, response, httpResponse);
  }

  #setHeaders(
    request: TRequest,
    response: TResponse,
    headerList: [string, string][],
  ): void {
    for (const [key, value] of headerList) {
      this._setHeader(request, response, key, value);
    }
  }

  #reply(
    request: TRequest,
    response: TResponse,
    value: ControllerResponse,
    statusCode?: StatusCode,
  ): TResult {
    let body: object | string | number | boolean | Readable | undefined =
      undefined;
    let httpStatusCode: StatusCode | undefined = statusCode;

    if (isResponse(value)) {
      body = value.body;
      httpStatusCode = value.statusCode;
    } else {
      body = value;
    }

    if (httpStatusCode !== undefined) {
      this._setStatus(request, response, httpStatusCode);
    }

    if (typeof body === 'string') {
      return this._replyText(request, response, body);
    } else if (body === undefined || typeof body === 'object') {
      if (body instanceof Readable) {
        return this._replyStream(request, response, body);
      } else {
        return this._replyJson(request, response, body);
      }
    } else {
      return this._replyText(request, response, JSON.stringify(body));
    }
  }

  #getMiddlewareHandlerFromMetadata(
    middlewareList: NewableFunction[],
  ): MiddlewareHandler<TRequest, TResponse, TNextFunction, TResult>[] {
    return middlewareList.map((newableFunction: NewableFunction) => {
      return async (
        request: TRequest,
        response: TResponse,
        next: TNextFunction,
      ): Promise<TResult> => {
        const middleware: Middleware<
          TRequest,
          TResponse,
          TNextFunction,
          TResult
        > = await this.#container.getAsync(newableFunction);

        return middleware.execute(request, response, next);
      };
    });
  }

  #getGuardHandlerFromMetadata(
    guardList: NewableFunction[],
  ): MiddlewareHandler<
    TRequest,
    TResponse,
    TNextFunction,
    TResult | undefined
  >[] {
    return guardList.map((newableFunction: NewableFunction) => {
      return async (
        request: TRequest,
        response: TResponse,
        next: TNextFunction,
      ): Promise<TResult | undefined> => {
        try {
          const guard: Guard<TRequest> =
            await this.#container.getAsync(newableFunction);

          const isAllowed: boolean = await guard.activate(request);

          if (isAllowed) {
            await next();

            return undefined;
          }

          return this.#reply(request, response, new ForbiddenResponse());
        } catch (error: unknown) {
          return this.#handleError(request, response, error);
        }
      };
    });
  }

  #printController(
    controllerName: string,
    path: string,
    routerExplorerControllerMethodMetadataList: RouterExplorerControllerMethodMetadata<
      TRequest,
      TResponse,
      unknown
    >[],
  ): void {
    this.#logger.info(`${controllerName} {${path}}:`);

    for (const controllerMethodMetadata of routerExplorerControllerMethodMetadataList) {
      this.#logger.info(
        `  - .${controllerMethodMetadata.methodKey as string}() mapped {${controllerMethodMetadata.path}, ${controllerMethodMetadata.requestMethodType}}`,
      );
    }
  }

  #printError(error: unknown): void {
    const errorMessage: string = DEFAULT_ERROR_MESSAGE;

    if (error instanceof Error) {
      this.#logger.error(error.stack ?? error.message);
    }

    this.#logger.error(errorMessage);
  }

  public abstract build(): Promise<unknown>;

  protected abstract _getBody(
    request: TRequest,
    parameterName?: string,
  ): unknown;

  protected abstract _getParams(
    request: TRequest,
    parameterName?: string,
  ): unknown;

  protected abstract _getQuery(
    request: TRequest,
    parameterName?: string,
  ): unknown;

  protected abstract _getHeaders(
    request: TRequest,
    parameterName?: string,
  ): unknown;

  protected abstract _getCookies(
    request: TRequest,
    response: TResponse,
    parameterName?: string,
  ): unknown;

  protected abstract _replyText(
    request: TRequest,
    response: TResponse,
    value: string,
  ): TResult;

  protected abstract _replyJson(
    request: TRequest,
    response: TResponse,
    value?: object,
  ): TResult;

  protected abstract _replyStream(
    request: TRequest,
    response: TResponse,
    value: Readable,
  ): TResult;

  protected abstract _setStatus(
    request: TRequest,
    response: TResponse,
    statusCode: StatusCode,
  ): void;

  protected abstract _setHeader(
    request: TRequest,
    response: TResponse,
    key: string,
    value: string,
  ): void;

  protected abstract _buildRouter(
    routerParams: RouterParams<TRequest, TResponse, TNextFunction, TResult>,
  ): void | Promise<void>;
}
