import {
  type Container,
  type Newable,
  type ServiceIdentifier,
} from 'inversify';

import { type ErrorFilter } from '../../error-filter/models/ErrorFilter.js';
import { type Guard } from '../../guard/models/Guard.js';
import { type Interceptor } from '../../interceptor/models/Interceptor.js';
import { buildMiddlewareOptionsFromApplyMiddlewareOptions } from '../../middleware/calculations/buildMiddlewareOptionsFromApplyMiddlewareOptions.js';
import { type ApplyMiddlewareOptions } from '../../middleware/models/ApplyMiddlewareOptions.js';
import { type Middleware } from '../../middleware/models/Middleware.js';
import { type MiddlewareOptions } from '../../middleware/models/MiddlewareOptions.js';
import { type Pipe } from '../../pipe/models/Pipe.js';

export abstract class InversifyServerAdapter<
  TServer = unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TRequest = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TResponse = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TNextFunction = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TResult = any,
> {
  protected readonly _container: Container;
  protected readonly _errorDiscriminatorToGlobalErrorFilterMap: Map<
    string | symbol,
    ErrorFilter | Newable<ErrorFilter>
  > = new Map();
  protected readonly _errorTypeToGlobalErrorFilterMap: Map<
    Newable<Error> | null,
    ErrorFilter | Newable<ErrorFilter>
  > = new Map();
  protected readonly _globalGuardList: ServiceIdentifier<Guard<TRequest>>[] =
    [];
  protected readonly _globalInterceptorList: ServiceIdentifier<
    Interceptor<TRequest, TResponse>
  >[] = [];
  protected readonly _globalPipeList: (ServiceIdentifier<Pipe> | Pipe)[] = [];
  protected readonly _postHandlerMiddlewareList: ServiceIdentifier<
    Middleware<TRequest, TResponse, TNextFunction, TResult>
  >[] = [];
  protected readonly _preHandlerMiddlewareList: ServiceIdentifier<
    Middleware<TRequest, TResponse, TNextFunction, TResult>
  >[] = [];
  #isBuilt: boolean = false;

  constructor(container: Container) {
    this._container = container;
  }

  protected get _isBuilt(): boolean {
    return this.#isBuilt;
  }

  public applyGlobalGuards(
    ...guardList: ServiceIdentifier<Guard<TRequest>>[]
  ): void {
    this.#assertNotBuilt(
      'Cannot apply global guards after the server has been built',
    );

    this._globalGuardList.push(...guardList);
  }

  public applyGlobalMiddleware(
    ...middlewareList: (
      ServiceIdentifier<Middleware> | ApplyMiddlewareOptions
    )[]
  ): void {
    this.#assertNotBuilt(
      'Cannot apply global middleware after the server has been built',
    );

    const middlewareOptions: MiddlewareOptions =
      buildMiddlewareOptionsFromApplyMiddlewareOptions(middlewareList);

    this._postHandlerMiddlewareList.push(
      ...middlewareOptions.postHandlerMiddlewareList,
    );
    this._preHandlerMiddlewareList.push(
      ...middlewareOptions.preHandlerMiddlewareList,
    );
  }

  public async build(): Promise<TServer> {
    this.#assertNotBuilt('The server has already been built');

    const bindServicesResult: void | Promise<void> = this._bindServices();

    if (bindServicesResult instanceof Promise) {
      await bindServicesResult;
    }

    /*
     * Some adapters require global middleware to be registered before
     * handlers. The child installs that middleware so a native stack, such
     * as Express, stays in charge of running it.
     */
    await this._applyGlobalPreHandlerMiddleware();

    await this._registerHandlers();

    this.#isBuilt = true;

    return this._getServer();
  }

  public useGlobalFilters(...errorFilterList: Newable<ErrorFilter>[]): void {
    for (const errorFilter of errorFilterList) {
      this._registerGlobalErrorFilter(errorFilter);
    }
  }

  public useGlobalInterceptors(
    ...interceptorList: ServiceIdentifier<Interceptor<TRequest, TResponse>>[]
  ): void {
    this.#assertNotBuilt(
      'Cannot apply global interceptors after the server has been built',
    );

    for (const interceptor of interceptorList) {
      this._globalInterceptorList.push(interceptor);
    }
  }

  public useGlobalPipe(...pipeList: (ServiceIdentifier<Pipe> | Pipe)[]): void {
    this.#assertNotBuilt(
      'Cannot apply global pipes after the server has been built',
    );

    this._globalPipeList.push(...pipeList);
  }

  #assertNotBuilt(message: string): void {
    if (this.#isBuilt) {
      this._throwInvalidOperationAfterBuild(message);
    }
  }

  protected abstract _applyGlobalPreHandlerMiddleware(): void | Promise<void>;

  protected abstract _bindServices(): void | Promise<void>;

  protected abstract _getServer(): TServer;

  protected abstract _registerGlobalErrorFilter(
    errorFilter: Newable<ErrorFilter>,
  ): void;

  protected abstract _registerHandlers(): void | Promise<void>;

  protected abstract _throwInvalidOperationAfterBuild(message: string): never;
}
