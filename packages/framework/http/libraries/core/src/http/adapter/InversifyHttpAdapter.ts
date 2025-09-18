import { Readable } from 'node:stream';

import {
  ApplyMiddlewareOptions,
  buildMiddlewareOptionsFromApplyMiddlewareOptions,
  ErrorFilter,
  Guard,
  Interceptor,
  isPipe,
  Middleware,
  MiddlewareOptions,
  Pipe,
  PipeMetadata,
} from '@inversifyjs/framework-core';
import { ConsoleLogger, Logger } from '@inversifyjs/logger';
import { getBaseType } from '@inversifyjs/prototype-utils';
import { Container, Newable } from 'inversify';

import { InversifyHttpAdapterError } from '../../error/models/InversifyHttpAdapterError';
import { InversifyHttpAdapterErrorKind } from '../../error/models/InversifyHttpAdapterErrorKind';
import { isHttpResponse } from '../../httpResponse/calculations/isHttpResponse';
import { ErrorHttpResponse } from '../../httpResponse/models/ErrorHttpResponse';
import { ForbiddenHttpResponse } from '../../httpResponse/models/ForbiddenHttpResponse';
import { HttpResponse } from '../../httpResponse/models/HttpResponse';
import { InternalServerErrorHttpResponse } from '../../httpResponse/models/InternalServerErrorHttpResponse';
import { buildRouterExplorerControllerMetadataList } from '../../routerExplorer/calculations/buildRouterExplorerControllerMetadataList';
import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { RouterExplorerControllerMetadata } from '../../routerExplorer/model/RouterExplorerControllerMetadata';
import { RouterExplorerControllerMethodMetadata } from '../../routerExplorer/model/RouterExplorerControllerMethodMetadata';
import { setErrorFilterToErrorFilterMap } from '../actions/setErrorFilterToErrorFilterMap';
import { buildInterceptedHandler } from '../calculations/buildInterceptedHandler';
import { ControllerResponse } from '../models/ControllerResponse';
import { HttpAdapterOptions } from '../models/HttpAdapterOptions';
import { HttpStatusCode } from '../models/HttpStatusCode';
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
    interceptorList: Interceptor<TRequest, TResponse>[];
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
  };
  readonly #awaitableRequestMethodParamTypes: Set<RequestMethodParameterType>;
  readonly #container: Container;
  readonly #errorTypeToGlobalErrorFilterMap: Map<
    Newable<Error> | null,
    Newable<ErrorFilter>
  >;
  readonly #globalGuardList: Newable<Guard<TRequest>>[];
  readonly #globalPipeList: (Newable<Pipe> | Pipe)[];
  readonly #logger: Logger;
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
    this.#globalGuardList = [];
    this.#globalPipeList = [];
    this.#errorTypeToGlobalErrorFilterMap = new Map();
    this.#logger = this.#buildLogger(this.httpAdapterOptions);
    this.#isBuilt = false;
    this.globalHandlers = {
      interceptorList: [],
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

  public useGlobalFilters(...errorFilterList: Newable<ErrorFilter>[]): void {
    for (const errorFilter of errorFilterList) {
      this.#setGlobalErrorFilter(errorFilter);
    }
  }

  public applyGlobalGuards(...guardList: Newable<Guard<TRequest>>[]): void {
    if (this.#isBuilt) {
      throw new InversifyHttpAdapterError(
        InversifyHttpAdapterErrorKind.invalidOperationAfterBuild,
        'Cannot apply global guard after the server has been built',
      );
    }

    this.#globalGuardList.push(...guardList);
  }

  public useGlobalInterceptors(
    ...interceptorList: Newable<Interceptor<TRequest, TResponse>>[]
  ): void {
    if (this.#isBuilt) {
      throw new InversifyHttpAdapterError(
        InversifyHttpAdapterErrorKind.invalidOperationAfterBuild,
        'Cannot apply global interceptor after the server has been built',
      );
    }

    for (const interceptor of interceptorList) {
      this.#setGlobalInterceptor(interceptor);
    }
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
      return new ConsoleLogger(undefined);
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
        path: routerExplorerControllerMetadata.path,
        postHandlerMiddlewareList: this.#getMiddlewareHandlerFromMetadata(
          routerExplorerControllerMetadata.postHandlerMiddlewareList,
        ),
        preHandlerMiddlewareList: this.#getMiddlewareHandlerFromMetadata(
          routerExplorerControllerMetadata.preHandlerMiddlewareList,
        ),
        routeParamsList: this.#builRouteParamdHandlerList(
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

  #builRouteParamdHandlerList(
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
        guardList: [
          ...this.#getGuardHandlerFromMetadata(
            this.#globalGuardList,
            routerExplorerControllerMethodMetadata,
          ),
          ...this.#getGuardHandlerFromMetadata(
            routerExplorerControllerMethodMetadata.guardList,
            routerExplorerControllerMethodMetadata,
          ),
        ],
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

    const handleError: (
      request: TRequest,
      response: TResponse,
      error: unknown,
    ) => Promise<TResult> = this.#buildHandleError(
      routerExplorerControllerMethodMetadata,
    );

    return buildInterceptedHandler(
      targetClass,
      routerExplorerControllerMethodMetadata,
      this.#container,
      buildHandlerParams,
      handleError,
      reply,
      this.#setHeaders.bind(this),
    );
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

  async #getErrorFilterForError(
    error: unknown,
    errorToFilterMap: Map<Newable<Error> | null, Newable<ErrorFilter>>,
  ): Promise<ErrorFilter<unknown, TRequest, TResponse, TResult> | undefined> {
    if (error instanceof Error) {
      let currentErrorType: Newable<Error> =
        error.constructor as Newable<Error>;

      while (currentErrorType !== Error) {
        const errorFilterType: Newable<ErrorFilter> | undefined =
          errorToFilterMap.get(currentErrorType);

        if (errorFilterType !== undefined) {
          return this.#container.getAsync(errorFilterType);
        }

        currentErrorType = getBaseType(currentErrorType) as Newable<Error>;
      }

      const errorFilterType: Newable<ErrorFilter> | undefined =
        errorToFilterMap.get(currentErrorType);

      if (errorFilterType !== undefined) {
        return this.#container.getAsync(errorFilterType);
      }
    }

    const errorFilterType: Newable<ErrorFilter> | undefined =
      errorToFilterMap.get(null);

    if (errorFilterType !== undefined) {
      return this.#container.getAsync(errorFilterType);
    }

    return undefined;
  }

  #buildHandleError(
    routerExplorerControllerMethodMetadata: RouterExplorerControllerMethodMetadata<
      TRequest,
      TResponse,
      unknown
    >,
  ): (
    request: TRequest,
    response: TResponse,
    error: unknown,
  ) => Promise<TResult> {
    const handleError: (
      request: TRequest,
      response: TResponse,
      error: unknown,
    ) => Promise<TResult> = async (
      request: TRequest,
      response: TResponse,
      error: unknown,
    ): Promise<TResult> => {
      const errorFilter:
        | ErrorFilter<unknown, TRequest, TResponse, TResult>
        | undefined =
        (await this.#getErrorFilterForError(
          error,
          routerExplorerControllerMethodMetadata.errorTypeToErrorFilterMap,
        )) ??
        (await this.#getErrorFilterForError(
          error,
          this.#errorTypeToGlobalErrorFilterMap,
        ));

      if (errorFilter === undefined) {
        let httpResponse: HttpResponse | undefined = undefined;

        if (ErrorHttpResponse.is(error)) {
          httpResponse = error;
        } else {
          this.#printError(error);

          httpResponse = new InternalServerErrorHttpResponse(
            undefined,
            undefined,
            {
              cause: error,
            },
          );
        }

        return this.#reply(request, response, httpResponse);
      }

      try {
        return await errorFilter.catch(error, request, response);
      } catch (error: unknown) {
        return handleError(request, response, error);
      }
    };

    return handleError;
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
    statusCode?: HttpStatusCode,
  ): TResult {
    let body: object | string | number | boolean | Readable | undefined =
      undefined;
    let httpStatusCode: HttpStatusCode | undefined = statusCode;

    if (isHttpResponse(value)) {
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
    guardList: Newable<Guard<TRequest>>[],
    routerExplorerControllerMethodMetadata: RouterExplorerControllerMethodMetadata<
      TRequest,
      TResponse
    >,
  ): MiddlewareHandler<
    TRequest,
    TResponse,
    TNextFunction,
    TResult | undefined
  >[] {
    const handleError: (
      request: TRequest,
      response: TResponse,
      error: unknown,
    ) => Promise<TResult> = this.#buildHandleError(
      routerExplorerControllerMethodMetadata,
    );

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

          return this.#reply(request, response, new ForbiddenHttpResponse());
        } catch (error: unknown) {
          return handleError(request, response, error);
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

  #setGlobalErrorFilter(errorFilter: Newable<ErrorFilter>): void {
    setErrorFilterToErrorFilterMap(
      this.#errorTypeToGlobalErrorFilterMap,
      errorFilter,
    );
  }

  #setGlobalInterceptor(
    interceptor: Newable<Interceptor<TRequest, TResponse>>,
  ): void {
    this.globalHandlers.interceptorList.push(
      this.#container.get<Interceptor<TRequest, TResponse>>(interceptor),
    );
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
    statusCode: HttpStatusCode,
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
