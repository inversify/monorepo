import { ConsoleLogger, Logger } from '@inversifyjs/logger';
import { Container } from 'inversify';

import { RouterExplorerControllerMetadata } from '../../routerExplorer/model/RouterExplorerControllerMetadata';
import { RouterExplorerControllerMethodMetadata } from '../../routerExplorer/model/RouterExplorerControllerMethodMetadata';
import { RouterExplorer } from '../../routerExplorer/RouterExplorer';
import { Guard } from '../guard/Guard';
import { Controller } from '../models/Controller';
import { ControllerMethodParameterMetadata } from '../models/ControllerMethodParameterMetadata';
import { ControllerResponse } from '../models/ControllerResponse';
import { HttpAdapterOptions } from '../models/HttpAdapterOptions';
import { InternalHttpAdapterOptions } from '../models/InternalHttpAdapterOptions';
import { Middleware } from '../models/Middleware';
import { RequestHandler } from '../models/RequestHandler';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { RouterParams } from '../models/RouterParams';
import { ForbiddenHttpResponse } from '../responses/error/ForbiddenHttpResponse';
import { InternalServerErrorHttpResponse } from '../responses/error/InternalServerErrorHttpResponse';
import { HttpResponse } from '../responses/HttpResponse';
import { HttpStatusCode } from '../responses/HttpStatusCode';

export abstract class InversifyHttpAdapter<
  TRequest,
  TResponse,
  TNextFunction extends (err?: unknown) => void,
> {
  readonly #container: Container;
  readonly #httpAdapterOptions: InternalHttpAdapterOptions;
  #logger: Logger;
  readonly #routerExplorer: RouterExplorer;

  constructor(container: Container, httpAdapterOptions?: HttpAdapterOptions) {
    this.#container = container;
    this.#routerExplorer = new RouterExplorer(container);
    this.#logger = new ConsoleLogger();
    this.#httpAdapterOptions =
      this.#parseHttpAdapterOptions(httpAdapterOptions);
  }

  protected async _buildServer(): Promise<void> {
    await this.#registerControllers();
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
      } else {
        this.#logger = httpAdapterOptions.logger;
      }
    }

    return internalHttpAdapterOptions;
  }

  async #registerControllers(): Promise<void> {
    const routerExplorerControllerMetadataList: RouterExplorerControllerMetadata[] =
      await this.#routerExplorer.getMetadataList();

    for (const routerExplorerControllerMetadata of routerExplorerControllerMetadataList) {
      await this._buildRouter(
        routerExplorerControllerMetadata.path,
        await this.#buildHandlers(
          routerExplorerControllerMetadata.target,
          routerExplorerControllerMetadata.controllerMethodMetadataList,
        ),
        await this.#getMiddlewareHandlerFromMetadata(
          routerExplorerControllerMetadata.middlewareList,
        ),
        await this.#getGuardHandlerFromMetadata(
          routerExplorerControllerMetadata.guardList,
        ),
      );

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
  ): Promise<RouterParams<TRequest, TResponse, TNextFunction>[]> {
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
          middlewareList: await this.#getMiddlewareHandlerFromMetadata(
            routerExplorerControllerMethodMetadata.middlewareList,
          ),
          path: routerExplorerControllerMethodMetadata.path,
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
      } catch (_error: unknown) {
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
    middlewareList: NewableFunction[] | undefined,
  ): Promise<RequestHandler<TRequest, TResponse, TNextFunction>[] | undefined> {
    if (middlewareList === undefined) {
      return undefined;
    }

    return Promise.all(
      middlewareList.map(async (newableFunction: NewableFunction) => {
        const middleware: Middleware<TRequest, TResponse, TNextFunction> =
          await this.#container.getAsync(newableFunction);

        return middleware.execute.bind(middleware);
      }),
    );
  }

  async #getGuardHandlerFromMetadata(
    guardList: NewableFunction[] | undefined,
  ): Promise<RequestHandler<TRequest, TResponse, TNextFunction>[] | undefined> {
    if (guardList === undefined) {
      return undefined;
    }

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
    path: string,
    routerParams: RouterParams<TRequest, TResponse, TNextFunction>[],
    guardList: RequestHandler<TRequest, TResponse, TNextFunction>[] | undefined,
    middlewareList:
      | RequestHandler<TRequest, TResponse, TNextFunction>[]
      | undefined,
  ): unknown;
}
