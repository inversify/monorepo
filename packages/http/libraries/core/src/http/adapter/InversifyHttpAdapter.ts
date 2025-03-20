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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TNextFunction extends (err?: any) => void,
> {
  readonly #container: Container;
  readonly #httpAdapterOptions: InternalHttpAdapterOptions;
  readonly #logger: Logger;

  constructor(container: Container, httpAdapterOptions?: HttpAdapterOptions) {
    this.#container = container;
    this.#logger = this.#buildLogger(httpAdapterOptions);
    this.#httpAdapterOptions =
      this.#parseHttpAdapterOptions(httpAdapterOptions);
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
    };

    if (httpAdapterOptions?.logger !== undefined) {
      if (typeof httpAdapterOptions.logger === 'boolean') {
        internalHttpAdapterOptions.logger = httpAdapterOptions.logger;
      }
    }

    return internalHttpAdapterOptions;
  }

  async #registerControllers(): Promise<void> {
    const routerExplorerControllerMetadataList: RouterExplorerControllerMetadata[] =
      await buildRouterExplorerControllerMetadataList(this.#container);

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

      if (this.#httpAdapterOptions.logger) {
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
    routerExplorerControllerMethodMetadata: RouterExplorerControllerMethodMetadata[],
  ): Promise<RouteParams<TRequest, TResponse, TNextFunction>[]> {
    const controller: Controller = await this.#container.getAsync(target);

    return Promise.all(
      routerExplorerControllerMethodMetadata.map(
        async (
          routerExplorerControllerMethodMetadata: RouterExplorerControllerMethodMetadata,
        ) => ({
          guardList: await this.#getGuardHandlerFromMetadata(
            routerExplorerControllerMethodMetadata.guardList,
          ),
          handler: this.#buildHandler(
            controller,
            routerExplorerControllerMethodMetadata.methodKey,
            routerExplorerControllerMethodMetadata.parameterMetadataList,
            routerExplorerControllerMethodMetadata.statusCode,
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
    controllerMethodParameterMetadataList: ControllerMethodParameterMetadata[],
    statusCode: HttpStatusCode | undefined,
  ): RequestHandler<TRequest, TResponse, TNextFunction> {
    return async (
      req: TRequest,
      res: TResponse,
      next: TNextFunction,
    ): Promise<unknown> => {
      try {
        const handlerParams: unknown[] = await this.#buildHandlerParams(
          controllerMethodParameterMetadataList,
          req,
          res,
          next,
        );

        const value: ControllerResponse = await controller[
          controllerMethodKey
        ]?.(...handlerParams);

        return this.#reply(req, res, value, statusCode);
      } catch (error: unknown) {
        this.#printError(error);
        return this.#reply(req, res, new InternalServerErrorHttpResponse());
      }
    };
  }

  async #buildHandlerParams(
    controllerMethodParameterMetadataList: ControllerMethodParameterMetadata[],
    request: TRequest,
    response: TResponse,
    next: TNextFunction,
  ): Promise<unknown[]> {
    return Promise.all(
      controllerMethodParameterMetadataList.map(
        async (
          controllerMethodParameterMetadata: ControllerMethodParameterMetadata,
        ) => {
          switch (controllerMethodParameterMetadata.parameterType) {
            case RequestMethodParameterType.BODY:
              return this._getBody(
                request,
                controllerMethodParameterMetadata.parameterName,
              );
            case RequestMethodParameterType.REQUEST: {
              return request;
            }
            case RequestMethodParameterType.RESPONSE: {
              return response;
            }
            case RequestMethodParameterType.PARAMS: {
              return this._getParams(
                request,
                controllerMethodParameterMetadata.parameterName,
              );
            }
            case RequestMethodParameterType.QUERY: {
              return this._getQuery(
                request,
                controllerMethodParameterMetadata.parameterName,
              );
            }
            case RequestMethodParameterType.HEADERS: {
              return this._getHeaders(
                request,
                controllerMethodParameterMetadata.parameterName,
              );
            }
            case RequestMethodParameterType.COOKIES: {
              return this._getCookies(
                request,
                controllerMethodParameterMetadata.parameterName,
              );
            }
            case RequestMethodParameterType.NEXT: {
              return next;
            }
          }
        },
      ),
    );
  }

  #reply(
    request: TRequest,
    response: TResponse,
    value: ControllerResponse,
    statusCode?: HttpStatusCode,
  ): unknown {
    let body: object | string | number | boolean | undefined = undefined;
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
      return this._replyJson(request, response, body);
    } else {
      return this._replyText(request, response, JSON.stringify(body));
    }
  }

  async #getMiddlewareHandlerFromMetadata(
    middlewareList: NewableFunction[],
  ): Promise<RequestHandler<TRequest, TResponse, TNextFunction>[]> {
    return Promise.all(
      middlewareList.map(async (newableFunction: NewableFunction) => {
        const middleware: Middleware<TRequest, TResponse, TNextFunction> =
          await this.#container.getAsync(newableFunction);

        return middleware.execute.bind(middleware);
      }),
    );
  }

  async #getGuardHandlerFromMetadata(
    guardList: NewableFunction[],
  ): Promise<RequestHandler<TRequest, TResponse, TNextFunction>[]> {
    return Promise.all(
      guardList.map(async (newableFunction: NewableFunction) => {
        const guard: Guard<TRequest> =
          await this.#container.getAsync(newableFunction);

        return async (
          request: TRequest,
          response: TResponse,
          next: TNextFunction,
        ) => {
          const activate: boolean = await guard.activate(request);

          if (!activate) {
            this.#reply(
              request,
              response,
              guard.getHttpResponse !== undefined
                ? guard.getHttpResponse()
                : new ForbiddenHttpResponse(),
            );
          } else {
            next();
          }
        };
      }),
    );
  }

  #printController(
    controllerName: string,
    path: string,
    routerExplorerControllerMethodMetadataList: RouterExplorerControllerMethodMetadata[],
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
    parameterName?: string,
  ): unknown;

  protected abstract _replyText(
    request: TRequest,
    response: TResponse,
    value: string,
  ): unknown;

  protected abstract _replyJson(
    request: TRequest,
    response: TResponse,
    value?: object,
  ): unknown;

  protected abstract _setStatus(
    request: TRequest,
    response: TResponse,
    statusCode: HttpStatusCode,
  ): void;

  protected abstract _buildRouter(
    routerParams: RouterParams<TRequest, TResponse, TNextFunction>,
  ): unknown;
}
