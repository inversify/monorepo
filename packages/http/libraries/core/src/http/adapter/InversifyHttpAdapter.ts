import { Readable } from 'node:stream';

import { ConsoleLogger, Logger } from '@inversifyjs/logger';
import { Container, Newable } from 'inversify';

import { InversifyHttpAdapterError } from '../../error/models/InversifyHttpAdapterError';
import { InversifyHttpAdapterErrorKind } from '../../error/models/InversifyHttpAdapterErrorKind';
import { buildMiddlewareOptionsFromApplyMiddlewareOptions } from '../../routerExplorer/calculations/buildMiddlewareOptionsFromApplyMiddlewareOptions';
import { buildRouterExplorerControllerMetadataList } from '../../routerExplorer/calculations/buildRouterExplorerControllerMetadataList';
import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { MiddlewareOptions } from '../../routerExplorer/model/MiddlewareOptions';
import { RouterExplorerControllerMetadata } from '../../routerExplorer/model/RouterExplorerControllerMetadata';
import { RouterExplorerControllerMethodMetadata } from '../../routerExplorer/model/RouterExplorerControllerMethodMetadata';
import { Guard } from '../guard/model/Guard';
import { Middleware } from '../middleware/model/Middleware';
import { ApplyMiddlewareOptions } from '../models/ApplyMiddlewareOptions';
import { Controller } from '../models/Controller';
import { ControllerResponse } from '../models/ControllerResponse';
import { HttpAdapterOptions } from '../models/HttpAdapterOptions';
import { InternalHttpAdapterOptions } from '../models/InternalHttpAdapterOptions';
import { MiddlewareHandler } from '../models/MiddlewareHandler';
import { RequestHandler } from '../models/RequestHandler';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { RouteParams } from '../models/RouteParams';
import { RouterParams } from '../models/RouterParams';
import { Pipe } from '../pipe/model/Pipe';
import { PipeMetadata } from '../pipe/model/PipeMetadata';
import { BadRequestHttpResponse } from '../responses/error/BadRequestHttpResponse';
import { ForbiddenHttpResponse } from '../responses/error/ForbiddenHttpResponse';
import { InternalServerErrorHttpResponse } from '../responses/error/InternalServerErrorHttpResponse';
import { HttpResponse } from '../responses/HttpResponse';
import { HttpStatusCode } from '../responses/HttpStatusCode';
import { isPipe } from '../typeguard/isPipe';

const DEFAULT_ERROR_MESSAGE: string = 'An unexpected error occurred';

export abstract class InversifyHttpAdapter<
  TRequest,
  TResponse,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TNextFunction extends (err?: any) => Promise<void> | void,
  TResult,
> {
  protected readonly httpAdapterOptions: InternalHttpAdapterOptions;
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
    httpAdapterOptions: HttpAdapterOptions | undefined,
    awaitableRequestMethodParamTypes?:
      | Iterable<RequestMethodParameterType>
      | undefined,
  ) {
    this.#awaitableRequestMethodParamTypes = new Set(
      awaitableRequestMethodParamTypes,
    );
    this.#container = container;
    this.#logger = this.#buildLogger(httpAdapterOptions);
    this.httpAdapterOptions = this.#parseHttpAdapterOptions(httpAdapterOptions);
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

  #buildLogger(httpAdapterOptions: HttpAdapterOptions | undefined): Logger {
    if (
      httpAdapterOptions?.logger === undefined ||
      typeof httpAdapterOptions.logger === 'boolean'
    ) {
      return new ConsoleLogger();
    }

    return httpAdapterOptions.logger;
  }

  #parseHttpAdapterOptions(
    httpAdapterOptions?: HttpAdapterOptions,
  ): InternalHttpAdapterOptions {
    const internalHttpAdapterOptions: InternalHttpAdapterOptions = {
      logger: true,
      useJson: httpAdapterOptions?.useJson ?? true,
    };

    if (httpAdapterOptions?.logger !== undefined) {
      if (typeof httpAdapterOptions.logger === 'boolean') {
        internalHttpAdapterOptions.logger = httpAdapterOptions.logger;
      }
    }

    return internalHttpAdapterOptions;
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

      if (this.httpAdapterOptions.logger) {
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
          routerExplorerControllerMethodMetadata.methodKey,
          routerExplorerControllerMethodMetadata.parameterMetadataList,
          routerExplorerControllerMethodMetadata.headerMetadataList,
          routerExplorerControllerMethodMetadata.statusCode,
          routerExplorerControllerMethodMetadata.useNativeHandler,
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
    controllerMethodKey: string | symbol,
    controllerMethodParameterMetadataList: (
      | ControllerMethodParameterMetadata<TRequest, TResponse, unknown>
      | undefined
    )[],
    headerMetadataList: [string, string][],
    statusCode: HttpStatusCode | undefined,
    useNativeHandler: boolean,
  ): RequestHandler<TRequest, TResponse, TNextFunction, TResult> {
    return async (
      req: TRequest,
      res: TResponse,
      next: TNextFunction,
    ): Promise<TResult> => {
      try {
        const controller: Controller =
          await this.#container.getAsync(targetClass);

        const handlerParams: unknown[] = await this.#buildHandlerParams(
          targetClass,
          controllerMethodKey,
          controllerMethodParameterMetadataList,
          req,
          res,
          next,
        );

        this.#setHeaders(req, res, headerMetadataList);

        const value: ControllerResponse | TResult = await controller[
          controllerMethodKey
        ]?.(...handlerParams);

        if (useNativeHandler) {
          return value as TResult;
        } else {
          return this.#reply(req, res, value, statusCode);
        }
      } catch (error: unknown) {
        this.#printError(error);

        if (
          InversifyHttpAdapterError.isErrorOfKind(
            error,
            InversifyHttpAdapterErrorKind.pipeError,
          )
        ) {
          return this.#reply(
            req,
            res,
            error.extraData?.response ?? new BadRequestHttpResponse(),
          );
        } else {
          return this.#reply(req, res, new InternalServerErrorHttpResponse());
        }
      }
    };
  }

  async #buildHandlerParams(
    targetClass: NewableFunction,
    controllerMethodKey: string | symbol,
    controllerMethodParameterMetadataList: (
      | ControllerMethodParameterMetadata<TRequest, TResponse, unknown>
      | undefined
    )[],
    request: TRequest,
    response: TResponse,
    next: TNextFunction,
  ): Promise<unknown[]> {
    const params: unknown[] = new Array(
      controllerMethodParameterMetadataList.length,
    );

    await Promise.all(
      controllerMethodParameterMetadataList.map(
        async (
          controllerMethodParameterMetadata:
            | ControllerMethodParameterMetadata<TRequest, TResponse, unknown>
            | undefined,
          index: number,
        ): Promise<void> => {
          if (controllerMethodParameterMetadata !== undefined) {
            let param: unknown;

            switch (controllerMethodParameterMetadata.parameterType) {
              case RequestMethodParameterType.BODY:
                param = this._getBody(
                  request,
                  controllerMethodParameterMetadata.parameterName,
                );
                break;
              case RequestMethodParameterType.REQUEST: {
                param = request;
                break;
              }
              case RequestMethodParameterType.RESPONSE: {
                param = response;
                break;
              }
              case RequestMethodParameterType.PARAMS: {
                param = this._getParams(
                  request,
                  controllerMethodParameterMetadata.parameterName,
                );
                break;
              }
              case RequestMethodParameterType.QUERY: {
                param = this._getQuery(
                  request,
                  controllerMethodParameterMetadata.parameterName,
                );
                break;
              }
              case RequestMethodParameterType.HEADERS: {
                param = this._getHeaders(
                  request,
                  controllerMethodParameterMetadata.parameterName,
                );
                break;
              }
              case RequestMethodParameterType.COOKIES: {
                param = this._getCookies(
                  request,
                  response,
                  controllerMethodParameterMetadata.parameterName,
                );
                break;
              }
              case RequestMethodParameterType.CUSTOM: {
                param =
                  controllerMethodParameterMetadata.customParameterDecoratorHandler?.(
                    request,
                    response,
                  );
                break;
              }
              case RequestMethodParameterType.NEXT: {
                param = next;
                break;
              }
            }

            await this.#appendHandlerParam(
              params,
              index,
              param,
              controllerMethodParameterMetadata.parameterType,
            );

            return this.#applyPipeList(
              params,
              [
                ...this.#globalPipeList,
                ...controllerMethodParameterMetadata.pipeList,
              ],
              {
                methodName: controllerMethodKey,
                parameterIndex: index,
                parameterMethodType:
                  controllerMethodParameterMetadata.parameterType,
                targetClass,
              },
            );
          }
        },
      ),
    );

    return params;
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

      try {
        params[pipeMetadata.parameterIndex] = await pipe.execute(
          params[pipeMetadata.parameterIndex],
          pipeMetadata,
        );
      } catch (error: unknown) {
        throw new InversifyHttpAdapterError(
          InversifyHttpAdapterErrorKind.pipeError,
          'Pipe error',
          { cause: error },
          { response: pipe.getHttpResponse?.() },
        );
      }
    }
  }

  #setHeaders(
    request: TRequest,
    response: TResponse,
    headerList: [string, string][],
  ): void {
    for (const header of headerList) {
      this._setHeader(request, response, header[0], header[1]);
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

    if (HttpResponse.is(value)) {
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
        const guard: Guard<TRequest> =
          await this.#container.getAsync(newableFunction);

        const activate: boolean = await guard.activate(request);

        if (!activate) {
          return this.#reply(
            request,
            response,
            guard.getHttpResponse?.() ?? new ForbiddenHttpResponse(),
          );
        } else {
          await next();

          return undefined;
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
        `.${controllerMethodMetadata.methodKey as string}() mapped {${controllerMethodMetadata.path}, ${controllerMethodMetadata.requestMethodType}}`,
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
