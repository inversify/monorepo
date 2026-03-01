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
import { Container, Newable, ServiceIdentifier } from 'inversify';

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
import { areAllParamsSync } from '../calculations/areAllParamsSync';
import { buildHttpResponseErrorFilter } from '../calculations/buildHttpResponseErrorFilter';
import { buildInterceptedHandler } from '../calculations/buildInterceptedHandler';
import { buildSyncCallRouteHandler } from '../calculations/buildSyncCallRouteHandler';
import { getErrorFilterForError } from '../calculations/getErrorFilterForError';
import { Controller } from '../models/Controller';
import { ControllerFunction } from '../models/ControllerFunction';
import { ControllerResponse } from '../models/ControllerResponse';
import { CustomNativeParameterDecoratorHandlerOptions } from '../models/CustomNativeParameterDecoratorHandlerOptions';
import { CustomParameterDecoratorHandlerOptions } from '../models/CustomParameterDecoratorHandlerOptions';
import { HttpAdapterOptions } from '../models/HttpAdapterOptions';
import { httpApplicationServiceIdentifier } from '../models/httpApplicationServiceIdentifier';
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
  TApp = unknown,
  TParams extends Record<string | number, unknown> = Record<string, string>,
> {
  protected readonly httpAdapterOptions: RequiredOptions<TOptions>;
  protected readonly _app: TApp;
  protected readonly _logger: Logger;
  readonly #awaitableRequestMethodParamTypes: Set<RequestMethodParameterType>;
  readonly #container: Container;
  readonly #customNativeParameterDecoratorHandlerOptions: CustomNativeParameterDecoratorHandlerOptions<
    TRequest,
    TResponse
  >;
  readonly #customParameterDecoratorHandlerOptions: CustomParameterDecoratorHandlerOptions<
    TRequest,
    TResponse
  >;
  readonly #errorTypeToGlobalErrorFilterMap: Map<
    Newable<Error> | null,
    ErrorFilter | Newable<ErrorFilter>
  >;
  readonly #globalGuardList: ServiceIdentifier<Guard<TRequest>>[];
  readonly #globalInterceptorList: ServiceIdentifier<
    Interceptor<TRequest, TResponse>
  >[];
  readonly #globalPipeList: (ServiceIdentifier<Pipe> | Pipe)[];
  readonly #postHandlerMiddlewareList: ServiceIdentifier<
    MiddlewareHandler<TRequest, TResponse, TNextFunction, TResult>
  >[];
  readonly #preHandlerMiddlewareList: ServiceIdentifier<
    MiddlewareHandler<TRequest, TResponse, TNextFunction, TResult>
  >[];
  #isBuilt: boolean;
  public abstract readonly id: string | symbol;

  constructor(
    container: Container,
    defaultHttpAdapterOptions: RequiredOptions<TOptions>,
    httpAdapterOptions: TOptions | undefined,
    awaitableRequestMethodParamTypes?:
      | Iterable<RequestMethodParameterType>
      | undefined,
    customApp?: TApp,
  ) {
    this.#awaitableRequestMethodParamTypes = new Set(
      awaitableRequestMethodParamTypes,
    );
    this.#container = container;
    this.#customParameterDecoratorHandlerOptions =
      this.#buildCustomParameterDecoratorHandlerOptions();
    this.#customNativeParameterDecoratorHandlerOptions =
      this.#buildCustomNativeParameterDecoratorHandlerOptions();
    this.httpAdapterOptions = this.#parseHttpAdapterOptions(
      defaultHttpAdapterOptions,
      httpAdapterOptions,
    );
    this.#globalGuardList = [];
    this.#globalInterceptorList = [];
    this.#globalPipeList = [];
    this.#errorTypeToGlobalErrorFilterMap = new Map();
    this._logger = this.#buildLogger(this.httpAdapterOptions);
    this.#isBuilt = false;
    this.#postHandlerMiddlewareList = [];
    this.#preHandlerMiddlewareList = [];

    this.#setErrorHttpResponseErrorFilter();

    this._app = this._buildApp(customApp);
  }

  public applyGlobalMiddleware(
    ...middlewareList: (
      | ServiceIdentifier<Middleware>
      | ApplyMiddlewareOptions
    )[]
  ): void {
    if (this.#isBuilt) {
      throw new InversifyHttpAdapterError(
        InversifyHttpAdapterErrorKind.invalidOperationAfterBuild,
        'Cannot apply global middleware after the server has been built',
      );
    }

    const middlewareOptions: MiddlewareOptions =
      buildMiddlewareOptionsFromApplyMiddlewareOptions(middlewareList);

    this.#postHandlerMiddlewareList.push(
      ...middlewareOptions.postHandlerMiddlewareList,
    );
    this.#preHandlerMiddlewareList.push(
      ...middlewareOptions.preHandlerMiddlewareList,
    );
  }

  public applyGlobalGuards(
    ...guardList: ServiceIdentifier<Guard<TRequest>>[]
  ): void {
    if (this.#isBuilt) {
      throw new InversifyHttpAdapterError(
        InversifyHttpAdapterErrorKind.invalidOperationAfterBuild,
        'Cannot apply global guards after the server has been built',
      );
    }

    this.#globalGuardList.push(...guardList);
  }

  public async build(): Promise<TApp> {
    if (this.#isBuilt) {
      throw new InversifyHttpAdapterError(
        InversifyHttpAdapterErrorKind.invalidOperationAfterBuild,
        'The server has already been built',
      );
    }

    this.#bindAdapterRelatedServices();

    await this.#registerControllers();

    this.#isBuilt = true;

    return this._app;
  }

  public useGlobalFilters(...errorFilterList: Newable<ErrorFilter>[]): void {
    for (const errorFilter of errorFilterList) {
      this.#setGlobalErrorFilter(errorFilter);
    }
  }

  public useGlobalInterceptors(
    ...interceptorList: ServiceIdentifier<Interceptor<TRequest, TResponse>>[]
  ): void {
    if (this.#isBuilt) {
      throw new InversifyHttpAdapterError(
        InversifyHttpAdapterErrorKind.invalidOperationAfterBuild,
        'Cannot apply global interceptors after the server has been built',
      );
    }

    for (const interceptor of interceptorList) {
      this.#globalInterceptorList.push(interceptor);
    }
  }

  public useGlobalPipe(...pipeList: (ServiceIdentifier<Pipe> | Pipe)[]): void {
    if (this.#isBuilt) {
      throw new InversifyHttpAdapterError(
        InversifyHttpAdapterErrorKind.invalidOperationAfterBuild,
        'Cannot apply global pipes after the server has been built',
      );
    }

    this.#globalPipeList.push(...pipeList);
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
    if (this.#container.isBound(httpApplicationServiceIdentifier)) {
      throw new InversifyHttpAdapterError(
        InversifyHttpAdapterErrorKind.invalidOperationAfterBuild,
        'An HTTP server is already registered in the container',
      );
    }

    this.#container
      .bind<TApp>(httpApplicationServiceIdentifier)
      .toConstantValue(this._app);
  }

  #buildCustomParameterDecoratorHandlerOptions(): CustomParameterDecoratorHandlerOptions<
    TRequest,
    TResponse
  > {
    return {
      getBody: this._getBody.bind(this),
      getCookies: this._getCookies.bind(this),
      getHeaders: this._getHeaders.bind(this),
      getParams: this._getParams.bind(this),
      getQuery: this._getQuery.bind(this),
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
      getParams: this._getParams.bind(this),
      getQuery: this._getQuery.bind(this),
      send: this.#reply.bind(this),
      sendBodySeparator: this._sendBodySeparator.bind(this),
      setHeader: this._setHeader.bind(this),
      setStatus: this._setStatus.bind(this),
    };
  }

  #buildLogger(httpAdapterOptions: RequiredOptions<TOptions>): Logger {
    if (typeof httpAdapterOptions.logger === 'boolean') {
      return new ConsoleLogger();
    }

    return httpAdapterOptions.logger;
  }

  #builRouteParamdHandlerList(
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
          routerExplorerControllerMetadata.serviceIdentifier,
          routerExplorerControllerMetadata.target,
          routerExplorerControllerMethodMetadata,
        ),
        path: routerExplorerControllerMethodMetadata.path,
        postHandlerMiddlewareList: [
          ...this.#getMiddlewareHandlerFromMetadata(
            routerExplorerControllerMethodMetadata,
            this.#postHandlerMiddlewareList,
          ),
          ...this.#getMiddlewareHandlerFromMetadata(
            routerExplorerControllerMethodMetadata,
            routerExplorerControllerMethodMetadata.postHandlerMiddlewareList,
          ),
        ],
        preHandlerMiddlewareList: [
          ...this.#getMiddlewareHandlerFromMetadata(
            routerExplorerControllerMethodMetadata,
            this.#preHandlerMiddlewareList,
          ),
          ...this.#getMiddlewareHandlerFromMetadata(
            routerExplorerControllerMethodMetadata,
            routerExplorerControllerMethodMetadata.preHandlerMiddlewareList,
          ),
        ],
        requestMethodType:
          routerExplorerControllerMethodMetadata.requestMethodType,
      }),
    );
  }

  #buildHandler(
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

    const handleError: (
      request: TRequest,
      response: TResponse,
      error: unknown,
    ) => Promise<TResult> = this.#buildHandleError(
      routerExplorerControllerMethodMetadata,
    );

    return buildInterceptedHandler(
      [
        ...routerExplorerControllerMethodMetadata.interceptorList,
        ...this.#globalInterceptorList,
      ],
      this.#container,
      buildCallRouteHandler,
      handleError,
      reply,
    );
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
    if (controllerMethodParameterMetadataList.length === 0) {
      return async (): Promise<ControllerResponse> => {
        const controller: Controller =
          await this.#container.getAsync<Controller>(serviceIdentifier);

        return (controller[controllerMethodKey] as ControllerFunction)();
      };
    }

    const provideSyncBuilder: boolean = areAllParamsSync(
      this.#awaitableRequestMethodParamTypes,
      controllerMethodParameterMetadataList,
      this.#globalPipeList,
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
      return buildSyncCallRouteHandler(
        this.#container,
        serviceIdentifier,
        controllerMethodKey,
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

      const controller: Controller =
        await this.#container.getAsync<Controller>(serviceIdentifier);

      return (controller[controllerMethodKey] as ControllerFunction)(...params);
    };
  }

  async #applyPipeList(
    params: unknown[],
    pipeList: (ServiceIdentifier<Pipe> | Pipe)[],
    pipeMetadata: PipeMetadata,
  ): Promise<void> {
    for (const pipeOrServiceIdentifier of pipeList) {
      const pipe: Pipe = isPipe(pipeOrServiceIdentifier)
        ? pipeOrServiceIdentifier
        : await this.#container.getAsync(pipeOrServiceIdentifier);

      params[pipeMetadata.parameterIndex] = await pipe.execute(
        params[pipeMetadata.parameterIndex],
        pipeMetadata,
      );
    }
  }

  async #getErrorFilterForError(
    error: unknown,
    errorToFilterMapList: Map<
      Newable<Error> | null,
      ErrorFilter | Newable<ErrorFilter>
    >[],
  ): Promise<ErrorFilter<unknown, TRequest, TResponse, TResult> | undefined> {
    return getErrorFilterForError(this.#container, error, errorToFilterMapList);
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
        | undefined = await this.#getErrorFilterForError(error, [
        routerExplorerControllerMethodMetadata.errorTypeToErrorFilterMap,
        this.#errorTypeToGlobalErrorFilterMap,
      ]);

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
    routerExplorerControllerMethodMetadata: RouterExplorerControllerMethodMetadata<
      TRequest,
      TResponse,
      TResult
    >,
    middlewareServiceIdentifierList: ServiceIdentifier<
      Middleware<TRequest, TResponse, TNextFunction, TResult>
    >[],
  ): MiddlewareHandler<TRequest, TResponse, TNextFunction, TResult>[] {
    const handleError: (
      request: TRequest,
      response: TResponse,
      error: unknown,
    ) => Promise<TResult> = this.#buildHandleError(
      routerExplorerControllerMethodMetadata,
    );

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
            > = await this.#container.getAsync(middlewareServiceIdentifier);

            return await middleware.execute(request, response, next);
          } catch (error: unknown) {
            return handleError(request, response, error);
          }
        };
      },
    );
  }

  #getGuardHandlerFromMetadata(
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
    const handleError: (
      request: TRequest,
      response: TResponse,
      error: unknown,
    ) => Promise<TResult> = this.#buildHandleError(
      routerExplorerControllerMethodMetadata,
    );

    return guardServiceIdentifierList.map(
      (guardServiceIdentifier: ServiceIdentifier<Guard<TRequest>>) => {
        return async (
          request: TRequest,
          response: TResponse,
          next: TNextFunction,
        ): Promise<TResult | undefined> => {
          try {
            const guard: Guard<TRequest> = await this.#container.getAsync(
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
      this.#container,
      this._logger,
    );

    for (const routerExplorerControllerMetadata of routerExplorerControllerMetadataList) {
      await this._buildRouter({
        path: routerExplorerControllerMetadata.path,
        routeParamsList: this.#builRouteParamdHandlerList(
          routerExplorerControllerMetadata,
        ),
      });

      this.#printController(
        routerExplorerControllerMetadata.target.name,
        routerExplorerControllerMetadata.path,
        routerExplorerControllerMetadata.controllerMethodMetadataList,
      );
    }
  }

  #setGlobalErrorFilter(errorFilter: Newable<ErrorFilter>): void {
    setErrorFilterToErrorFilterMap(
      this._logger,
      this.#errorTypeToGlobalErrorFilterMap,
      errorFilter,
    );
  }

  #setErrorHttpResponseErrorFilter(): void {
    this.#errorTypeToGlobalErrorFilterMap.set(
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
}
