import { Readable } from 'node:stream';

import { ConsoleLogger, Logger } from '@inversifyjs/logger';
import { Container } from 'inversify';

import { buildRouterExplorerControllerMetadataList } from '../../routerExplorer/calculations/buildRouterExplorerControllerMetadataList';
import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { RouterExplorerControllerMetadata } from '../../routerExplorer/model/RouterExplorerControllerMetadata';
import { RouterExplorerControllerMethodMetadata } from '../../routerExplorer/model/RouterExplorerControllerMethodMetadata';
import { Guard } from '../guard/model/Guard';
import { Middleware } from '../middleware/model/Middleware';
import { Controller } from '../models/Controller';
import { ControllerResponse } from '../models/ControllerResponse';
import { HttpAdapterOptions } from '../models/HttpAdapterOptions';
import { InternalHttpAdapterOptions } from '../models/InternalHttpAdapterOptions';
import { MiddlewareHandler } from '../models/MiddlewareHandler';
import { RequestHandler } from '../models/RequestHandler';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { RouteParams } from '../models/RouteParams';
import { RouterParams } from '../models/RouterParams';
import { ForbiddenHttpResponse } from '../responses/error/ForbiddenHttpResponse';
import { InternalServerErrorHttpResponse } from '../responses/error/InternalServerErrorHttpResponse';
import { HttpResponse } from '../responses/HttpResponse';
import { HttpStatusCode } from '../responses/HttpStatusCode';

const DEFAULT_ERROR_MESSAGE: string = 'An unexpected error occurred';

export abstract class InversifyHttpAdapter<
  TRequest,
  TResponse,
  TNextFunction extends (err?: unknown) => void,
  TResult,
> {
  protected readonly httpAdapterOptions: InternalHttpAdapterOptions;
  readonly #container: Container;
  readonly #logger: Logger;

  constructor(container: Container, httpAdapterOptions?: HttpAdapterOptions) {
    this.#container = container;
    this.#logger = this.#buildLogger(httpAdapterOptions);
    this.httpAdapterOptions = this.#parseHttpAdapterOptions(httpAdapterOptions);
  }

  protected async _buildServer(): Promise<void> {
    await this.#registerControllers();
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
      unknown
    >[] = await buildRouterExplorerControllerMetadataList(this.#container);

    for (const routerExplorerControllerMetadata of routerExplorerControllerMetadataList) {
      await this._buildRouter({
        guardList: await this.#getGuardHandlerFromMetadata(
          routerExplorerControllerMetadata.guardList,
        ),
        path: routerExplorerControllerMetadata.path,
        postHandlerMiddlewareList: await this.#getMiddlewareHandlerFromMetadata(
          routerExplorerControllerMetadata.postHandlerMiddlewareList,
        ),
        preHandlerMiddlewareList: await this.#getMiddlewareHandlerFromMetadata(
          routerExplorerControllerMetadata.preHandlerMiddlewareList,
        ),
        routeParamsList: await this.#buildHandlers(
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

  async #buildHandlers(
    target: NewableFunction,
    routerExplorerControllerMethodMetadata: RouterExplorerControllerMethodMetadata<
      TRequest,
      TResponse,
      unknown
    >[],
  ): Promise<RouteParams<TRequest, TResponse, TNextFunction, TResult>[]> {
    const controller: Controller = await this.#container.getAsync(target);

    return Promise.all(
      routerExplorerControllerMethodMetadata.map(
        async (
          routerExplorerControllerMethodMetadata: RouterExplorerControllerMethodMetadata<
            TRequest,
            TResponse,
            unknown
          >,
        ) => ({
          guardList: await this.#getGuardHandlerFromMetadata(
            routerExplorerControllerMethodMetadata.guardList,
          ),
          handler: this.#buildHandler(
            controller,
            routerExplorerControllerMethodMetadata.methodKey,
            routerExplorerControllerMethodMetadata.parameterMetadataList,
            routerExplorerControllerMethodMetadata.headerMetadataList,
            routerExplorerControllerMethodMetadata.statusCode,
            routerExplorerControllerMethodMetadata.useNativeHandler,
          ),
          path: routerExplorerControllerMethodMetadata.path,
          postHandlerMiddlewareList:
            await this.#getMiddlewareHandlerFromMetadata(
              routerExplorerControllerMethodMetadata.postHandlerMiddlewareList,
            ),
          preHandlerMiddlewareList:
            await this.#getMiddlewareHandlerFromMetadata(
              routerExplorerControllerMethodMetadata.preHandlerMiddlewareList,
            ),
          requestMethodType:
            routerExplorerControllerMethodMetadata.requestMethodType,
        }),
      ),
    );
  }

  #buildHandler(
    controller: Controller,
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
        const handlerParams: unknown[] = await this.#buildHandlerParams(
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
        return this.#reply(req, res, new InternalServerErrorHttpResponse());
      }
    };
  }

  async #buildHandlerParams(
    controllerMethodParameterMetadataList: (
      | ControllerMethodParameterMetadata<TRequest, TResponse, unknown>
      | undefined
    )[],
    request: TRequest,
    response: TResponse,
    next: TNextFunction,
  ): Promise<unknown[]> {
    const handlerParams: unknown[] = [];

    for (const controllerMethodParameterMetadata of controllerMethodParameterMetadataList) {
      if (controllerMethodParameterMetadata === undefined) {
        handlerParams.push(undefined);
      } else if (
        controllerMethodParameterMetadata.parameterType ===
        RequestMethodParameterType.BODY
      ) {
        handlerParams.push(
          await this._getBody(
            request,
            controllerMethodParameterMetadata.parameterName,
          ),
        );
      } else {
        switch (controllerMethodParameterMetadata.parameterType) {
          case RequestMethodParameterType.PARAMS:
            handlerParams.push(
              this._getParams(
                request,
                controllerMethodParameterMetadata.parameterName,
              ),
            );
            break;
          case RequestMethodParameterType.QUERY:
            handlerParams.push(
              this._getQuery(
                request,
                controllerMethodParameterMetadata.parameterName,
              ),
            );
            break;
          case RequestMethodParameterType.HEADERS:
            handlerParams.push(
              this._getHeaders(
                request,
                controllerMethodParameterMetadata.parameterName,
              ),
            );
            break;
          case RequestMethodParameterType.COOKIES:
            handlerParams.push(
              this._getCookies(
                request,
                response,
                controllerMethodParameterMetadata.parameterName,
              ),
            );
            break;
          case RequestMethodParameterType.NEXT:
            handlerParams.push(next);
            break;
          case RequestMethodParameterType.REQUEST:
            handlerParams.push(request);
            break;
          case RequestMethodParameterType.RESPONSE:
            handlerParams.push(response);
            break;
          case RequestMethodParameterType.CUSTOM: {
            handlerParams.push(
              controllerMethodParameterMetadata.customParameterDecoratorHandler?.(
                request,
                response,
              ),
            );
            break;
          }
        }
      }
    }

    return handlerParams;
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

  async #getMiddlewareHandlerFromMetadata(
    middlewareList: NewableFunction[],
  ): Promise<MiddlewareHandler<TRequest, TResponse, TNextFunction, TResult>[]> {
    return Promise.all(
      middlewareList.map(async (newableFunction: NewableFunction) => {
        const middleware: Middleware<
          TRequest,
          TResponse,
          TNextFunction,
          TResult
        > = await this.#container.getAsync(newableFunction);

        return middleware.execute.bind(middleware);
      }),
    );
  }

  async #getGuardHandlerFromMetadata(
    guardList: NewableFunction[],
  ): Promise<
    MiddlewareHandler<TRequest, TResponse, TNextFunction, TResult | undefined>[]
  > {
    return Promise.all(
      guardList.map(async (newableFunction: NewableFunction) => {
        const guard: Guard<TRequest> =
          await this.#container.getAsync(newableFunction);

        return async (
          request: TRequest,
          response: TResponse,
          next: TNextFunction,
        ): Promise<TResult | undefined> => {
          const activate: boolean = await guard.activate(request);

          if (!activate) {
            return this.#reply(
              request,
              response,
              guard.getHttpResponse !== undefined
                ? guard.getHttpResponse()
                : new ForbiddenHttpResponse(),
            );
          } else {
            next();

            return undefined;
          }
        };
      }),
    );
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
  ): Promise<unknown>;

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
