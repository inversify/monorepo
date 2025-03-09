import { getReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Container } from 'inversify';

import { InversifyHttpAdapterError } from '../../error/models/InversifyHttpAdapterError';
import { InversifyHttpAdapterErrorKind } from '../../error/models/InversifyHttpAdapterErrorKind';
import { controllerMetadataReflectKey } from '../../reflectMetadata/data/controllerMetadataReflectKey';
import { controllerMethodMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodMetadataReflectKey';
import { controllerMethodMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodMiddlewareMetadataReflectKey';
import { controllerMethodParameterMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodParameterMetadataReflectKey';
import { controllerMethodStatusCodeMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodStatusCodeMetadataReflectKey';
import { controllerMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/controllerMiddlewareMetadataReflectKey';
import { Controller } from '../models/Controller';
import { ControllerFunction } from '../models/ControllerFunction';
import { ControllerMetadata } from '../models/ControllerMetadata';
import { ControllerMethodMetadata } from '../models/ControllerMethodMetadata';
import { ControllerMethodParameterMetadata } from '../models/ControllerMethodParameterMetadata';
import { ControllerResponse } from '../models/ControllerResponse';
import { HttpAdapterOptions } from '../models/HttpAdapterOptions';
import { Middleware } from '../models/Middleware';
import { RequestHandler } from '../models/RequestHandler';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { RouterParams } from '../models/RouterParams';
import { InternalServerErrorHttpResponse } from '../responses/error/InternalServerErrorHttpResponse';
import { HttpResponse } from '../responses/HttpResponse';
import { HttpStatusCode } from '../responses/HttpStatusCode';

export abstract class InversifyHttpAdapter<
  TRequest,
  TResponse,
  TNextFunction extends (err?: unknown) => void,
> {
  readonly #container: Container;
  readonly #httpAdapterOptions: HttpAdapterOptions;

  constructor(
    container: Container,
    httpAdapterOptions: HttpAdapterOptions = { logger: true },
  ) {
    this.#container = container;
    this.#httpAdapterOptions = httpAdapterOptions;
  }

  protected _buildServer(): void {
    this.#registerControllers();
  }

  #registerControllers(): void {
    const controllerMetadataList: ControllerMetadata[] | undefined =
      getReflectMetadata(Reflect, controllerMetadataReflectKey);

    if (controllerMetadataList === undefined) {
      throw new InversifyHttpAdapterError(
        InversifyHttpAdapterErrorKind.noControllerFound,
      );
    }

    this.#buildHandlers(controllerMetadataList);
  }

  #buildHandlers(controllerMetadataList: ControllerMetadata[]): void {
    for (const controllerMetadata of controllerMetadataList) {
      const controllerMethodMetadataList:
        | ControllerMethodMetadata[]
        | undefined = getReflectMetadata(
        controllerMetadata.target,
        controllerMethodMetadataReflectKey,
      );

      const controllerMiddlewareList: NewableFunction[] | undefined =
        getReflectMetadata(
          controllerMetadata.target,
          controllerMiddlewareMetadataReflectKey,
        );

      if (controllerMethodMetadataList !== undefined) {
        const routerParams: RouterParams<TRequest, TResponse, TNextFunction>[] =
          this.#buildRouterParams(
            controllerMetadata,
            controllerMethodMetadataList,
          );

        this._buildRouter(
          controllerMetadata.path,
          routerParams,
          this.#getMiddlewareHandlerFromMetadata(controllerMiddlewareList),
        );

        if (
          this.#httpAdapterOptions.logger === undefined ||
          this.#httpAdapterOptions.logger
        ) {
          this.#printController(
            controllerMetadata.target.name,
            controllerMetadata.path,
            controllerMethodMetadataList,
          );
        }
      }
    }
  }

  #buildRouterParams(
    controllerMetadata: ControllerMetadata,
    controllerMethodMetadataList: ControllerMethodMetadata[],
  ): RouterParams<TRequest, TResponse, TNextFunction>[] {
    const routerParams: RouterParams<TRequest, TResponse, TNextFunction>[] = [];

    for (const controllerMethodMetadata of controllerMethodMetadataList) {
      if (
        (controllerMetadata.controllerName === undefined &&
          this.#container.isBound(controllerMetadata.target)) ||
        (controllerMetadata.controllerName !== undefined &&
          this.#container.isBound(controllerMetadata.target, {
            name: controllerMetadata.controllerName,
          }))
      ) {
        const controller: Controller =
          controllerMetadata.controllerName === undefined
            ? this.#container.get(controllerMetadata.target)
            : this.#container.get(controllerMetadata.target, {
                name: controllerMetadata.controllerName,
              });

        const parameterMetadataList:
          | ControllerMethodParameterMetadata[]
          | undefined = getReflectMetadata(
          controller[controllerMethodMetadata.methodKey] as ControllerFunction,
          controllerMethodParameterMetadataReflectKey,
        );

        const statusCode: HttpStatusCode | undefined = getReflectMetadata(
          controller[controllerMethodMetadata.methodKey] as ControllerFunction,
          controllerMethodStatusCodeMetadataReflectKey,
        );

        const controllerMethodMiddlewareList: NewableFunction[] | undefined =
          getReflectMetadata(
            controller[
              controllerMethodMetadata.methodKey
            ] as ControllerFunction,
            controllerMethodMiddlewareMetadataReflectKey,
          );

        routerParams.push({
          handler: this.#buildHandler(
            controllerMethodMetadata,
            parameterMetadataList ?? [],
            controller,
            statusCode,
          ),
          middlewareList: this.#getMiddlewareHandlerFromMetadata(
            controllerMethodMiddlewareList,
          ),
          path: controllerMethodMetadata.path,
          requestMethodType: controllerMethodMetadata.requestMethodType,
        });
      }
    }

    return routerParams;
  }

  #buildHandler(
    controllerMethodMetadata: ControllerMethodMetadata,
    controllerMethodParameterMetadataList: ControllerMethodParameterMetadata[],
    controller: Controller,
    statusCode: HttpStatusCode | undefined,
  ): RequestHandler<TRequest, TResponse, TNextFunction> {
    return async (
      req: TRequest,
      res: TResponse,
      next: TNextFunction,
    ): Promise<unknown> => {
      try {
        const handlerParams: unknown[] = await Promise.all(
          this.#buildHandlerParams(
            controllerMethodParameterMetadataList,
            req,
            res,
            next,
          ),
        );

        const value: ControllerResponse = await (
          controller[controllerMethodMetadata.methodKey] as ControllerFunction
        )(...handlerParams);

        return this.#reply(req, res, value, statusCode);
      } catch (_error: unknown) {
        return this.#reply(req, res, new InternalServerErrorHttpResponse());
      }
    };
  }

  #buildHandlerParams(
    controllerMethodParameterMetadataList: ControllerMethodParameterMetadata[],
    request: TRequest,
    response: TResponse,
    next: TNextFunction,
  ): Promise<unknown>[] {
    return controllerMethodParameterMetadataList.map(
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

  #getMiddlewareHandlerFromMetadata(
    middlewareList: NewableFunction[] | undefined,
  ): RequestHandler<TRequest, TResponse, TNextFunction>[] | undefined {
    let requestHandlerList:
      | RequestHandler<TRequest, TResponse, TNextFunction>[]
      | undefined = undefined;

    if (middlewareList !== undefined) {
      requestHandlerList = middlewareList.map(
        (newableFunction: NewableFunction) => {
          const middleware: Middleware<TRequest, TResponse, TNextFunction> =
            this.#container.get(newableFunction);

          return middleware.execute.bind(middleware);
        },
      );
    }

    return requestHandlerList;
  }

  #printController(
    controllerName: string,
    path: string,
    controllerMethodMetadataList: ControllerMethodMetadata[],
  ): void {
    console.log(`${controllerName} {${path}}:`);

    for (const controllerMethodMetadata of controllerMethodMetadataList) {
      console.log(
        `.${controllerMethodMetadata.methodKey as string}() mapped {${controllerMethodMetadata.path}, ${controllerMethodMetadata.requestMethodType}}`,
      );
    }
  }

  public abstract build(): unknown;

  protected abstract _getBody(
    request: TRequest,
    parameterName?: string | symbol,
  ): Promise<unknown>;

  protected abstract _getParams(
    request: TRequest,
    parameterName?: string | symbol,
  ): unknown;

  protected abstract _getQuery(
    request: TRequest,
    parameterName?: string | symbol,
  ): unknown;

  protected abstract _getHeaders(
    request: TRequest,
    parameterName?: string | symbol,
  ): unknown;

  protected abstract _getCookies(
    request: TRequest,
    parameterName?: string | symbol,
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
    middlewareList:
      | RequestHandler<TRequest, TResponse, TNextFunction>[]
      | undefined,
  ): unknown;
}
