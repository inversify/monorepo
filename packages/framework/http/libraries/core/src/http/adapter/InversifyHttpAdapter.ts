import { Readable } from 'node:stream';

import {
  applyPipeList,
  type ErrorFilter,
  type Guard,
  type Interceptor,
  InversifyServerAdapter,
  type Middleware,
  MiddlewarePhase,
} from '@inversifyjs/framework-core';
import {
  buildHttpInstrumentationContext,
  type HttpInstrumentationContext,
  markHttpInstrumentedHandler,
} from '@inversifyjs/http-instrumentation-core';
import { ConsoleLogger, type Logger } from '@inversifyjs/logger';
import {
  type Container,
  type Newable,
  type ServiceIdentifier,
} from 'inversify';

import { InversifyHttpAdapterError } from '../../error/models/InversifyHttpAdapterError.js';
import { InversifyHttpAdapterErrorKind } from '../../error/models/InversifyHttpAdapterErrorKind.js';
import { isHttpResponse } from '../../httpResponse/calculations/isHttpResponse.js';
import { ErrorHttpResponse } from '../../httpResponse/models/ErrorHttpResponse.js';
import { ForbiddenHttpResponse } from '../../httpResponse/models/ForbiddenHttpResponse.js';
import { type HttpResponse } from '../../httpResponse/models/HttpResponse.js';
import { InternalServerErrorHttpResponse } from '../../httpResponse/models/InternalServerErrorHttpResponse.js';
import {
  buildInstrumentedAsyncCallRouteHandler,
  buildInstrumentedParameterlessCallRouteHandler,
  buildInstrumentedSyncCallRouteHandler,
  readControllerName,
} from '../../instrumentation/actions/buildInstrumentedCallRouteHandler.js';
import { buildInstrumentedGuardHandler } from '../../instrumentation/actions/buildInstrumentedGuardHandler.js';
import { buildInstrumentedHandleError } from '../../instrumentation/actions/buildInstrumentedHandleError.js';
import { buildInstrumentedInterceptedHandler } from '../../instrumentation/actions/buildInstrumentedInterceptedHandler.js';
import { buildInstrumentedMiddlewareHandler } from '../../instrumentation/actions/buildInstrumentedMiddlewareHandler.js';
import { buildRouterExplorerControllerMetadataList } from '../../routerExplorer/calculations/buildRouterExplorerControllerMetadataList.js';
import { type ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata.js';
import { type RouterExplorerControllerMetadata } from '../../routerExplorer/model/RouterExplorerControllerMetadata.js';
import { type RouterExplorerControllerMethodMetadata } from '../../routerExplorer/model/RouterExplorerControllerMethodMetadata.js';
import { setErrorFilterToErrorFilterMap } from '../actions/setErrorFilterToErrorFilterMap.js';
import { areAllParamsSync } from '../calculations/areAllParamsSync.js';
import { buildHttpResponseErrorFilter } from '../calculations/buildHttpResponseErrorFilter.js';
import { buildInterceptedHandler } from '../calculations/buildInterceptedHandler.js';
import { buildSyncCallRouteHandler } from '../calculations/buildSyncCallRouteHandler.js';
import { getErrorFilterForError } from '../calculations/getErrorFilterForError.js';
import { type Controller } from '../models/Controller.js';
import { type ControllerFunction } from '../models/ControllerFunction.js';
import { type ControllerResponse } from '../models/ControllerResponse.js';
import { type CustomNativeParameterDecoratorHandlerOptions } from '../models/CustomNativeParameterDecoratorHandlerOptions.js';
import { type CustomParameterDecoratorHandlerOptions } from '../models/CustomParameterDecoratorHandlerOptions.js';
import { type HttpAdapterOptions } from '../models/HttpAdapterOptions.js';
import { httpApplicationServiceIdentifier } from '../models/httpApplicationServiceIdentifier.js';
import { type HttpStatusCode } from '../models/HttpStatusCode.js';
import { type MiddlewareHandler } from '../models/MiddlewareHandler.js';
import { type RequestHandler } from '../models/RequestHandler.js';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType.js';
import { type RequiredOptions } from '../models/RequiredOptions.js';
import { type RouteParams } from '../models/RouteParams.js';
import { type RouterParams } from '../models/RouterParams.js';

const DEFAULT_ERROR_MESSAGE: string = 'An unexpected error occurred';

export abstract class InversifyHttpAdapter<
  TRequest,
  TResponse,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TNextFunction extends (err?: any) => Promise<void> | void,
  TResult,
  TOptions extends HttpAdapterOptions = HttpAdapterOptions,
  TApp = unknown,
  TParams extends Record<string | number, unknown> = Record<string, string>,
> extends InversifyServerAdapter<
  TApp,
  TRequest,
  TResponse,
  TNextFunction,
  TResult
> {
  protected readonly httpAdapterOptions: RequiredOptions<TOptions>;
  protected readonly _app: TApp;
  protected readonly _httpInstrumentation:
    HttpInstrumentationContext | undefined;
  protected readonly _logger: Logger;
  readonly #awaitableRequestMethodParamTypes: Set<RequestMethodParameterType>;
  readonly #customNativeParameterDecoratorHandlerOptions: CustomNativeParameterDecoratorHandlerOptions<
    TRequest,
    TResponse
  >;
  readonly #customParameterDecoratorHandlerOptions: CustomParameterDecoratorHandlerOptions<
    TRequest,
    TResponse
  >;
  public abstract readonly id: string | symbol;

  constructor(
    container: Container,
    defaultHttpAdapterOptions: RequiredOptions<TOptions>,
    httpAdapterOptions: TOptions | undefined,
    awaitableRequestMethodParamTypes?:
      Iterable<RequestMethodParameterType> | undefined,
    customApp?: TApp,
  ) {
    super(container);

    this.#awaitableRequestMethodParamTypes = new Set([
      ...(awaitableRequestMethodParamTypes ?? []),
      RequestMethodParameterType.Custom,
      RequestMethodParameterType.CustomNative,
    ]);
    this.#customParameterDecoratorHandlerOptions =
      this.#buildCustomParameterDecoratorHandlerOptions();
    this.#customNativeParameterDecoratorHandlerOptions =
      this.#buildCustomNativeParameterDecoratorHandlerOptions();
    this.httpAdapterOptions = this.#parseHttpAdapterOptions(
      defaultHttpAdapterOptions,
      httpAdapterOptions,
    );
    this._logger = this.#buildLogger(this.httpAdapterOptions);
    this._httpInstrumentation = buildHttpInstrumentationContext(
      this.httpAdapterOptions.instrumentation,
      (error: unknown): void => {
        this.#reportSinkError(error);
      },
    );

    this.#setErrorHttpResponseErrorFilter();

    this._app = this._buildApp(customApp);
  }

  protected _getRouteValueMetadataHandler(
    _routeValueMetadataMap: Map<string | symbol, unknown>,
  ):
    MiddlewareHandler<TRequest, TResponse, TNextFunction, TResult> | undefined {
    return undefined;
  }

  protected override _applyGlobalPreHandlerMiddleware(): void | Promise<void> {
    return this._applyGlobalPreHandlerMiddlewareList(
      this.#buildGlobalMiddlewareHandlerList(this._preHandlerMiddlewareList),
    );
  }

  protected override _bindServices(): void {
    this.#bindAdapterRelatedServices();
  }

  protected override _getServer(): TApp {
    return this._app;
  }

  protected override _registerGlobalErrorFilter(
    errorFilter: Newable<ErrorFilter>,
  ): void {
    setErrorFilterToErrorFilterMap(
      this._logger,
      this._errorDiscriminatorToGlobalErrorFilterMap,
      this._errorTypeToGlobalErrorFilterMap,
      errorFilter,
    );
  }

  // Returning the controller-registration promise keeps the same await point as
  // the previous `build()` implementation.
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  protected override _registerHandlers(): Promise<void> {
    return this.#registerControllers();
  }

  protected override _throwInvalidOperationAfterBuild(message: string): never {
    throw new InversifyHttpAdapterError(
      InversifyHttpAdapterErrorKind.invalidOperationAfterBuild,
      message,
    );
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

  #appendHeaderMetadata(
    headerMetadata: Record<string, string> | undefined,
    headers: Record<string, string> | undefined,
  ): Record<string, string> | undefined {
    if (headerMetadata === undefined) {
      return headers;
    }

    if (headers === undefined) {
      return { ...headerMetadata };
    }

    for (const key in headerMetadata) {
      if (!Object.hasOwn(headers, key)) {
        headers[key] = headerMetadata[key] as string;
      }
    }

    return headers;
  }

  #bindAdapterRelatedServices(): void {
    if (this._container.isBound(httpApplicationServiceIdentifier)) {
      throw new InversifyHttpAdapterError(
        InversifyHttpAdapterErrorKind.invalidOperationAfterBuild,
        'An HTTP server is already registered in the container',
      );
    }

    this._container
      .bind<TApp>(httpApplicationServiceIdentifier)
      .toConstantValue(this._app);
  }

  #buildCallRouteHandler(
    targetClass: NewableFunction,
    controllerMethodKey: string | symbol,
    controllerMethodParameterMetadataList: (
      | ControllerMethodParameterMetadata<TRequest, TResponse, TResult>
      | undefined
    )[],
    serviceIdentifier: ServiceIdentifier,
  ): (
    request: TRequest,
    response: TResponse,
    next: TNextFunction,
  ) => Promise<ControllerResponse> {
    const instrumentation: HttpInstrumentationContext | undefined =
      this._httpInstrumentation;

    if (controllerMethodParameterMetadataList.length === 0) {
      if (instrumentation !== undefined) {
        return buildInstrumentedParameterlessCallRouteHandler(
          instrumentation,
          this._container,
          serviceIdentifier,
          readControllerName(targetClass),
          controllerMethodKey,
        ) as (
          request: TRequest,
          response: TResponse,
          next: TNextFunction,
        ) => Promise<ControllerResponse>;
      }

      return async (): Promise<ControllerResponse> => {
        const controller: Controller =
          await this._container.getAsync<Controller>(
            serviceIdentifier as ServiceIdentifier<Controller>,
          );

        return (controller[controllerMethodKey] as ControllerFunction)();
      };
    }

    const provideSyncBuilder: boolean = areAllParamsSync(
      this.#awaitableRequestMethodParamTypes,
      controllerMethodParameterMetadataList,
      this._globalPipeList,
    );

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
          | ControllerMethodParameterMetadata<TRequest, TResponse, TResult>
          | undefined,
      ) => {
        if (controllerMethodParameterMetadata === undefined) {
          return undefined;
        }

        switch (controllerMethodParameterMetadata.parameterType) {
          case RequestMethodParameterType.Body:
            return (request: TRequest, response: TResponse): unknown =>
              this._getBody(
                request,
                response,
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
              controllerMethodParameterMetadata.customParameterDecoratorHandler(
                request,
                response,
                this.#customParameterDecoratorHandlerOptions,
              );
          case RequestMethodParameterType.CustomNative:
            return (request: TRequest, response: TResponse): unknown =>
              controllerMethodParameterMetadata.customParameterDecoratorHandler(
                request,
                response,
                this.#customNativeParameterDecoratorHandlerOptions,
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

    if (provideSyncBuilder) {
      if (instrumentation !== undefined) {
        return buildInstrumentedSyncCallRouteHandler(
          instrumentation,
          this._container,
          serviceIdentifier,
          readControllerName(targetClass),
          controllerMethodKey,
          paramBuilders,
        );
      }

      return buildSyncCallRouteHandler(
        this._container,
        serviceIdentifier,
        controllerMethodKey,
        paramBuilders,
      );
    }

    if (instrumentation !== undefined) {
      return buildInstrumentedAsyncCallRouteHandler(
        instrumentation,
        this._container,
        this.#awaitableRequestMethodParamTypes,
        this._globalPipeList,
        targetClass,
        controllerMethodKey,
        controllerMethodParameterMetadataList,
        serviceIdentifier,
        paramBuilders,
      );
    }

    return async (
      request: TRequest,
      response: TResponse,
      next: TNextFunction,
    ): Promise<ControllerResponse> => {
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

            await applyPipeList(
              this._container,
              params,
              [
                ...this._globalPipeList,
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

      const controller: Controller = await this._container.getAsync<Controller>(
        serviceIdentifier as ServiceIdentifier<Controller>,
      );

      return (controller[controllerMethodKey] as ControllerFunction)(...params);
    };
  }

  #buildCustomParameterDecoratorHandlerOptions(): CustomParameterDecoratorHandlerOptions<
    TRequest,
    TResponse
  > {
    return {
      getBody: this._getBody.bind(this),
      getCookies: this._getCookies.bind(this),
      getHeaders: this._getHeaders.bind(this),
      getMethod: this._getMethod.bind(this),
      getParams: this._getParams.bind(this),
      getQuery: this._getQuery.bind(this),
      getUrl: this._getUrl.bind(this),
      setHeader: this._setHeader.bind(this),
      setStatus: this._setStatus.bind(this),
    };
  }

  #buildCustomNativeParameterDecoratorHandlerOptions(): CustomNativeParameterDecoratorHandlerOptions<
    TRequest,
    TResponse
  > {
    return {
      getBody: this._getBody.bind(this),
      getCookies: this._getCookies.bind(this),
      getHeaders: this._getHeaders.bind(this),
      getMethod: this._getMethod.bind(this),
      getParams: this._getParams.bind(this),
      getQuery: this._getQuery.bind(this),
      getUrl: this._getUrl.bind(this),
      send: this.#reply.bind(this),
      sendBodySeparator: this._sendBodySeparator.bind(this),
      setHeader: this._setHeader.bind(this),
      setStatus: this._setStatus.bind(this),
    };
  }

  #buildHandler(
    handleError: (
      request: TRequest,
      response: TResponse,
      error: unknown,
    ) => Promise<TResult>,
    serviceIdentifier: ServiceIdentifier,
    targetClass: NewableFunction,
    routerExplorerControllerMethodMetadata: RouterExplorerControllerMethodMetadata<
      TRequest,
      TResponse,
      TResult
    >,
  ): RequestHandler<TRequest, TResponse, TNextFunction, TResult> {
    const buildCallRouteHandler: (
      request: TRequest,
      response: TResponse,
      next: TNextFunction,
    ) => Promise<ControllerResponse> = this.#buildCallRouteHandler(
      targetClass,
      routerExplorerControllerMethodMetadata.methodKey,
      routerExplorerControllerMethodMetadata.parameterMetadataList,
      serviceIdentifier,
    );

    let reply: (
      req: TRequest,
      res: TResponse,
      value: ControllerResponse,
    ) => TResult | Promise<TResult>;

    if (routerExplorerControllerMethodMetadata.useNativeHandler) {
      reply = (req: TRequest, res: TResponse, value: ControllerResponse) => {
        if (routerExplorerControllerMethodMetadata.statusCode !== undefined) {
          this._setStatus(
            req,
            res,
            routerExplorerControllerMethodMetadata.statusCode,
          );
        }

        this.#setHeaders(
          req,
          res,
          routerExplorerControllerMethodMetadata.headerMetadataList,
        );

        return value as TResult;
      };
    } else {
      reply = (
        req: TRequest,
        res: TResponse,
        value: ControllerResponse,
      ): TResult | Promise<TResult> =>
        this.#reply(
          req,
          res,
          value,
          routerExplorerControllerMethodMetadata.statusCode,
          routerExplorerControllerMethodMetadata.headerMetadataList,
        );
    }

    const interceptorList: ServiceIdentifier<
      Interceptor<TRequest, TResponse>
    >[] = [
      ...routerExplorerControllerMethodMetadata.interceptorList,
      ...this._globalInterceptorList,
    ];
    const instrumentation: HttpInstrumentationContext | undefined =
      this._httpInstrumentation;
    const handler: RequestHandler<TRequest, TResponse, TNextFunction, TResult> =
      instrumentation !== undefined && interceptorList.length > 0
        ? buildInstrumentedInterceptedHandler(
            instrumentation,
            interceptorList,
            this._container,
            buildCallRouteHandler,
            handleError,
            reply,
          )
        : buildInterceptedHandler(
            interceptorList,
            this._container,
            buildCallRouteHandler,
            handleError,
            reply,
          );

    if (instrumentation !== undefined) {
      markHttpInstrumentedHandler(handler);
    }

    return handler;
  }

  #buildLogger(httpAdapterOptions: RequiredOptions<TOptions>): Logger {
    if (typeof httpAdapterOptions.logger === 'boolean') {
      return new ConsoleLogger();
    }

    return httpAdapterOptions.logger;
  }

  #buildRouteParamHandlerList(
    routerExplorerControllerMetadata: RouterExplorerControllerMetadata<
      TRequest,
      TResponse,
      TResult
    >,
  ): RouteParams<TRequest, TResponse, TNextFunction, TResult>[] {
    return routerExplorerControllerMetadata.controllerMethodMetadataList.map(
      (
        routerExplorerControllerMethodMetadata: RouterExplorerControllerMethodMetadata<
          TRequest,
          TResponse,
          TResult
        >,
      ): RouteParams<TRequest, TResponse, TNextFunction, TResult> => {
        const handleError: (
          request: TRequest,
          response: TResponse,
          error: unknown,
        ) => Promise<TResult> = this.#buildHandleError(
          routerExplorerControllerMethodMetadata,
        );

        return {
          guardList: [
            ...this.#getGuardHandlerFromMetadata(
              handleError,
              this._globalGuardList,
              routerExplorerControllerMethodMetadata,
            ),
            ...this.#getGuardHandlerFromMetadata(
              handleError,
              routerExplorerControllerMethodMetadata.guardList,
              routerExplorerControllerMethodMetadata,
            ),
          ],
          handleError,
          handler: this.#buildHandler(
            handleError,
            routerExplorerControllerMetadata.serviceIdentifier,
            routerExplorerControllerMetadata.target,
            routerExplorerControllerMethodMetadata,
          ),
          methodKey: routerExplorerControllerMethodMetadata.methodKey,
          path: routerExplorerControllerMethodMetadata.path,
          postHandlerMiddlewareList: this.#buildRoutePostMiddlewareList(
            handleError,
            routerExplorerControllerMethodMetadata,
          ),
          preHandlerMiddlewareList: this.#buildRoutePreMiddlewareList(
            handleError,
            routerExplorerControllerMethodMetadata,
          ),
          requestMethodType:
            routerExplorerControllerMethodMetadata.requestMethodType,
          routeValueMetadataMap:
            routerExplorerControllerMethodMetadata.routeValueMetadataMap,
        };
      },
    );
  }

  #buildRoutePostMiddlewareList(
    handleError: (
      request: TRequest,
      response: TResponse,
      error: unknown,
    ) => Promise<TResult>,
    routerExplorerControllerMethodMetadata: RouterExplorerControllerMethodMetadata<
      TRequest,
      TResponse,
      TResult
    >,
  ): MiddlewareHandler<TRequest, TResponse, TNextFunction, TResult>[] {
    return [
      ...this.#getMiddlewareHandlerFromMetadata(
        handleError,
        routerExplorerControllerMethodMetadata.postHandlerMiddlewareList,
        MiddlewarePhase.PostHandler,
      ),
      ...this.#getMiddlewareHandlerFromMetadata(
        handleError,
        this._postHandlerMiddlewareList,
        MiddlewarePhase.PostHandler,
      ),
    ];
  }

  #buildRoutePreMiddlewareList(
    handleError: (
      request: TRequest,
      response: TResponse,
      error: unknown,
    ) => Promise<TResult>,
    routerExplorerControllerMethodMetadata: RouterExplorerControllerMethodMetadata<
      TRequest,
      TResponse,
      TResult
    >,
  ): MiddlewareHandler<TRequest, TResponse, TNextFunction, TResult>[] {
    const preHandlerMiddlewareList: MiddlewareHandler<
      TRequest,
      TResponse,
      TNextFunction,
      TResult
    >[] = [];

    const routeValueMetadataHandler:
      | MiddlewareHandler<TRequest, TResponse, TNextFunction, TResult>
      | undefined = this._getRouteValueMetadataHandler(
      routerExplorerControllerMethodMetadata.routeValueMetadataMap,
    );

    if (routeValueMetadataHandler !== undefined) {
      preHandlerMiddlewareList.push(routeValueMetadataHandler);
    }

    preHandlerMiddlewareList.push(
      ...this.#getMiddlewareHandlerFromMetadata(
        handleError,
        routerExplorerControllerMethodMetadata.preHandlerMiddlewareList,
        MiddlewarePhase.PreHandler,
      ),
    );

    return preHandlerMiddlewareList;
  }

  async #getErrorFilterForError(
    error: unknown,
    errorDiscriminatorToFilterMapList: Map<
      string | symbol,
      ErrorFilter | Newable<ErrorFilter>
    >[],
    errorToFilterMapList: Map<
      Newable<Error> | null,
      ErrorFilter | Newable<ErrorFilter>
    >[],
  ): Promise<ErrorFilter<unknown, TRequest, TResponse, TResult> | undefined> {
    return getErrorFilterForError(
      this._container,
      error,
      errorDiscriminatorToFilterMapList,
      errorToFilterMapList,
    );
  }

  #buildGlobalHandleError(): (
    request: TRequest,
    response: TResponse,
    error: unknown,
  ) => Promise<TResult> {
    const instrumentation: HttpInstrumentationContext | undefined =
      this._httpInstrumentation;

    if (instrumentation !== undefined) {
      return buildInstrumentedHandleError(
        instrumentation,
        async (error: unknown) =>
          this.#getErrorFilterForError(
            error,
            [this._errorDiscriminatorToGlobalErrorFilterMap],
            [this._errorTypeToGlobalErrorFilterMap],
          ),
        async (request: TRequest, response: TResponse, error: unknown) => {
          this.#printError(error);

          const httpResponse: HttpResponse =
            new InternalServerErrorHttpResponse(undefined, undefined, {
              cause: error,
            });

          return this.#reply(
            request,
            response,
            httpResponse,
            undefined,
            undefined,
          );
        },
      );
    }

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
        ErrorFilter<unknown, TRequest, TResponse, TResult> | undefined =
        await this.#getErrorFilterForError(
          error,
          [this._errorDiscriminatorToGlobalErrorFilterMap],
          [this._errorTypeToGlobalErrorFilterMap],
        );

      if (errorFilter === undefined) {
        this.#printError(error);

        const httpResponse: HttpResponse = new InternalServerErrorHttpResponse(
          undefined,
          undefined,
          {
            cause: error,
          },
        );

        return this.#reply(
          request,
          response,
          httpResponse,
          undefined,
          undefined,
        );
      }

      try {
        return await errorFilter.catch(error, request, response);
      } catch (error: unknown) {
        return handleError(request, response, error);
      }
    };

    return handleError;
  }

  #buildGlobalMiddlewareHandlerList(
    middlewareServiceIdentifierList: ServiceIdentifier<
      Middleware<TRequest, TResponse, TNextFunction, TResult>
    >[],
  ): MiddlewareHandler<TRequest, TResponse, TNextFunction, TResult>[] {
    const handleError: (
      request: TRequest,
      response: TResponse,
      error: unknown,
    ) => Promise<TResult> = this.#buildGlobalHandleError();
    const instrumentation: HttpInstrumentationContext | undefined =
      this._httpInstrumentation;

    if (instrumentation !== undefined) {
      return middlewareServiceIdentifierList.map(
        (
          middlewareServiceIdentifier: ServiceIdentifier<
            Middleware<TRequest, TResponse, TNextFunction, TResult>
          >,
        ) =>
          buildInstrumentedMiddlewareHandler(
            instrumentation,
            this._container,
            handleError,
            middlewareServiceIdentifier,
            MiddlewarePhase.PreHandler,
          ),
      );
    }

    return middlewareServiceIdentifierList.map(
      (
        middlewareServiceIdentifier: ServiceIdentifier<
          Middleware<TRequest, TResponse, TNextFunction, TResult>
        >,
      ) => {
        return async (
          request: TRequest,
          response: TResponse,
          next: TNextFunction,
        ): Promise<TResult> => {
          try {
            const middleware: Middleware<
              TRequest,
              TResponse,
              TNextFunction,
              TResult
            > = await this._container.getAsync(middlewareServiceIdentifier);

            return await middleware.execute(request, response, next);
          } catch (error: unknown) {
            return handleError(request, response, error);
          }
        };
      },
    );
  }

  #buildHandleError(
    routerExplorerControllerMethodMetadata: RouterExplorerControllerMethodMetadata<
      TRequest,
      TResponse,
      TResult
    >,
  ): (
    request: TRequest,
    response: TResponse,
    error: unknown,
  ) => Promise<TResult> {
    const instrumentation: HttpInstrumentationContext | undefined =
      this._httpInstrumentation;

    if (instrumentation !== undefined) {
      return buildInstrumentedHandleError(
        instrumentation,
        async (error: unknown) =>
          this.#getErrorFilterForError(
            error,
            [
              routerExplorerControllerMethodMetadata.errorDiscriminatorToErrorFilterMap,
              this._errorDiscriminatorToGlobalErrorFilterMap,
            ],
            [
              routerExplorerControllerMethodMetadata.errorTypeToErrorFilterMap,
              this._errorTypeToGlobalErrorFilterMap,
            ],
          ),
        async (request: TRequest, response: TResponse, error: unknown) => {
          this.#printError(error);

          const httpResponse: HttpResponse =
            new InternalServerErrorHttpResponse(undefined, undefined, {
              cause: error,
            });

          return this.#reply(
            request,
            response,
            httpResponse,
            undefined,
            routerExplorerControllerMethodMetadata.headerMetadataList,
          );
        },
      );
    }

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
        ErrorFilter<unknown, TRequest, TResponse, TResult> | undefined =
        await this.#getErrorFilterForError(
          error,
          [
            routerExplorerControllerMethodMetadata.errorDiscriminatorToErrorFilterMap,
            this._errorDiscriminatorToGlobalErrorFilterMap,
          ],
          [
            routerExplorerControllerMethodMetadata.errorTypeToErrorFilterMap,
            this._errorTypeToGlobalErrorFilterMap,
          ],
        );

      if (errorFilter === undefined) {
        this.#printError(error);

        const httpResponse: HttpResponse = new InternalServerErrorHttpResponse(
          undefined,
          undefined,
          {
            cause: error,
          },
        );

        return this.#reply(
          request,
          response,
          httpResponse,
          undefined,
          routerExplorerControllerMethodMetadata.headerMetadataList,
        );
      }

      try {
        return await errorFilter.catch(error, request, response);
      } catch (error: unknown) {
        return handleError(request, response, error);
      }
    };

    return handleError;
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

  #reply(
    request: TRequest,
    response: TResponse,
    value: ControllerResponse,
    statusCode?: HttpStatusCode,
    headerMetadata?: Record<string, string>,
  ): TResult | Promise<TResult> {
    let httpStatusCode: HttpStatusCode | undefined = statusCode;
    let headers: Record<string, string> | undefined = undefined;
    let body: object | string | number | boolean | Readable | undefined;

    if (isHttpResponse(value)) {
      httpStatusCode = value.statusCode;
      headers = value.headers;
      body = value.body;
    } else {
      body = value;
    }

    if (httpStatusCode !== undefined) {
      this._setStatus(request, response, httpStatusCode);
    }

    headers = this.#appendHeaderMetadata(headerMetadata, headers);

    if (headers !== undefined) {
      this.#setHeaders(request, response, headers);
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

  #setHeaders(
    request: TRequest,
    response: TResponse,
    headers: Record<string, string>,
  ): void {
    for (const key in headers) {
      this._setHeader(request, response, key, headers[key] as string);
    }
  }

  #getMiddlewareHandlerFromMetadata(
    handleError: (
      request: TRequest,
      response: TResponse,
      error: unknown,
    ) => Promise<TResult>,
    middlewareServiceIdentifierList: ServiceIdentifier<
      Middleware<TRequest, TResponse, TNextFunction, TResult>
    >[],
    phase: MiddlewarePhase,
  ): MiddlewareHandler<TRequest, TResponse, TNextFunction, TResult>[] {
    const instrumentation: HttpInstrumentationContext | undefined =
      this._httpInstrumentation;

    if (instrumentation !== undefined) {
      return middlewareServiceIdentifierList.map(
        (
          middlewareServiceIdentifier: ServiceIdentifier<
            Middleware<TRequest, TResponse, TNextFunction, TResult>
          >,
        ) =>
          buildInstrumentedMiddlewareHandler(
            instrumentation,
            this._container,
            handleError,
            middlewareServiceIdentifier,
            phase,
          ),
      );
    }

    return middlewareServiceIdentifierList.map(
      (
        middlewareServiceIdentifier: ServiceIdentifier<
          Middleware<TRequest, TResponse, TNextFunction, TResult>
        >,
      ) => {
        return async (
          request: TRequest,
          response: TResponse,
          next: TNextFunction,
        ): Promise<TResult> => {
          try {
            const middleware: Middleware<
              TRequest,
              TResponse,
              TNextFunction,
              TResult
            > = await this._container.getAsync(middlewareServiceIdentifier);

            return await middleware.execute(request, response, next);
          } catch (error: unknown) {
            return handleError(request, response, error);
          }
        };
      },
    );
  }

  #getGuardHandlerFromMetadata(
    handleError: (
      request: TRequest,
      response: TResponse,
      error: unknown,
    ) => Promise<TResult>,
    guardServiceIdentifierList: ServiceIdentifier<Guard<TRequest>>[],
    routerExplorerControllerMethodMetadata: RouterExplorerControllerMethodMetadata<
      TRequest,
      TResponse,
      TResult
    >,
  ): MiddlewareHandler<
    TRequest,
    TResponse,
    TNextFunction,
    TResult | undefined
  >[] {
    const instrumentation: HttpInstrumentationContext | undefined =
      this._httpInstrumentation;

    if (instrumentation !== undefined) {
      return guardServiceIdentifierList.map(
        (guardServiceIdentifier: ServiceIdentifier<Guard<TRequest>>) =>
          buildInstrumentedGuardHandler(
            instrumentation,
            this._container,
            handleError,
            guardServiceIdentifier,
            async (request: TRequest, response: TResponse) =>
              this.#reply(
                request,
                response,
                new ForbiddenHttpResponse(),
                undefined,
                routerExplorerControllerMethodMetadata.headerMetadataList,
              ),
          ),
      );
    }

    return guardServiceIdentifierList.map(
      (guardServiceIdentifier: ServiceIdentifier<Guard<TRequest>>) => {
        return async (
          request: TRequest,
          response: TResponse,
          next: TNextFunction,
        ): Promise<TResult | undefined> => {
          try {
            const guard: Guard<TRequest> = await this._container.getAsync(
              guardServiceIdentifier,
            );

            const isAllowed: boolean = await guard.activate(request);

            if (isAllowed) {
              await next();

              return undefined;
            }

            return await this.#reply(
              request,
              response,
              new ForbiddenHttpResponse(),
              undefined,
              routerExplorerControllerMethodMetadata.headerMetadataList,
            );
          } catch (error: unknown) {
            return handleError(request, response, error);
          }
        };
      },
    );
  }

  #printController(
    controllerName: string,
    path: string,
    routerExplorerControllerMethodMetadataList: RouterExplorerControllerMethodMetadata<
      TRequest,
      TResponse,
      TResult
    >[],
  ): void {
    if (this.httpAdapterOptions.logger !== false) {
      this._logger.info(`${controllerName} {${path}}:`);

      for (const controllerMethodMetadata of routerExplorerControllerMethodMetadataList) {
        this._logger.info(
          `  - .${controllerMethodMetadata.methodKey as string}() mapped {${controllerMethodMetadata.path}, ${controllerMethodMetadata.requestMethodType}}`,
        );
      }
    }
  }

  #reportSinkError(error: unknown): void {
    if (this.httpAdapterOptions.logger === false) {
      return;
    }

    if (error instanceof Error) {
      this._logger.error(error.stack ?? error.message);

      return;
    }

    this._logger.error('HTTP instrumentation sink failed');
  }

  #printError(error: unknown): void {
    const errorMessage: string = DEFAULT_ERROR_MESSAGE;

    if (error instanceof Error) {
      this._logger.error(error.stack ?? error.message);
    }

    this._logger.error(errorMessage);
  }

  async #registerControllers(): Promise<void> {
    const routerExplorerControllerMetadataList: RouterExplorerControllerMetadata<
      TRequest,
      TResponse,
      TResult
    >[] = buildRouterExplorerControllerMetadataList(
      this._container,
      this._logger,
    );

    for (const routerExplorerControllerMetadata of routerExplorerControllerMetadataList) {
      await this._buildRouter({
        path: routerExplorerControllerMetadata.path,
        routeParamsList: this.#buildRouteParamHandlerList(
          routerExplorerControllerMetadata,
        ),
        target: routerExplorerControllerMetadata.target,
      });

      this.#printController(
        routerExplorerControllerMetadata.target.name,
        routerExplorerControllerMetadata.path,
        routerExplorerControllerMetadata.controllerMethodMetadataList,
      );
    }
  }

  #setErrorHttpResponseErrorFilter(): void {
    this._errorTypeToGlobalErrorFilterMap.set(
      ErrorHttpResponse,
      buildHttpResponseErrorFilter(this.#reply.bind(this)),
    );
  }

  protected abstract _buildApp(customApp: TApp | undefined): TApp;

  protected abstract _getBody(
    request: TRequest,
    response: TResponse,
    parameterName?: string,
  ): unknown;

  protected abstract _getMethod(request: TRequest): string;

  protected abstract _getParams(request: TRequest): TParams;
  protected abstract _getParams(
    request: TRequest,
    parameterName: string,
  ): TParams[string] | undefined;
  protected abstract _getParams(
    request: TRequest,
    parameterName?: string,
  ): TParams | TParams[string] | undefined;

  protected abstract _getQuery(request: TRequest): Record<string, unknown>;
  protected abstract _getQuery(
    request: TRequest,
    parameterName: string,
  ): unknown;
  protected abstract _getQuery(
    request: TRequest,
    parameterName?: string,
  ): unknown;

  protected abstract _getHeaders(
    request: TRequest,
  ): Record<string, string | string[] | undefined>;
  protected abstract _getHeaders(
    request: TRequest,
    parameterName: string,
  ): string | string[] | undefined;
  protected abstract _getHeaders(
    request: TRequest,
    parameterName?: string,
  ):
    | Record<string, string | string[] | undefined>
    | string
    | string[]
    | undefined;

  protected abstract _getCookies(
    request: TRequest,
    response: TResponse,
    parameterName?: string,
  ): unknown;

  protected abstract _getUrl(request: TRequest): string;

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
  ): TResult | Promise<TResult>;

  protected abstract _sendBodySeparator(
    request: TRequest,
    response: TResponse,
  ): void | Promise<void>;

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

  protected abstract _applyGlobalPreHandlerMiddlewareList(
    handlerList: MiddlewareHandler<
      TRequest,
      TResponse,
      TNextFunction,
      TResult
    >[],
  ): void | Promise<void>;
}
