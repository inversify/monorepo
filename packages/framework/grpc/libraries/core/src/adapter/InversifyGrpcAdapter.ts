import {
  type ErrorFilter,
  type Guard,
  type Interceptor,
  type InterceptorTransformObject,
  InversifyServerAdapter,
  type Middleware,
} from '@inversifyjs/framework-core';
import { ConsoleLogger, type Logger } from '@inversifyjs/logger';
import {
  type Container,
  type Newable,
  type ServiceIdentifier,
} from 'inversify';

import { InversifyGrpcAdapterError } from '../error/models/InversifyGrpcAdapterError.js';
import { InversifyGrpcAdapterErrorKind } from '../error/models/InversifyGrpcAdapterErrorKind.js';
import { setErrorFilterToErrorFilterMap } from '../errorFilter/actions/setErrorFilterToErrorFilterMap.js';
import { getErrorFilterForError } from '../errorFilter/calculations/getErrorFilterForError.js';
import { buildGrpcExplorerServiceMetadataList } from '../explorer/calculations/buildGrpcExplorerServiceMetadataList.js';
import { type GrpcExplorerRpcMetadata } from '../explorer/model/GrpcExplorerRpcMetadata.js';
import { type GrpcExplorerServiceMetadata } from '../explorer/model/GrpcExplorerServiceMetadata.js';
import { buildGrpcErrorFilter } from '../grpcError/calculations/buildGrpcErrorFilter.js';
import { GrpcError } from '../grpcError/models/GrpcError.js';
import { PermissionDeniedGrpcError } from '../grpcError/models/PermissionDeniedGrpcError.js';
import { UnknownGrpcError } from '../grpcError/models/UnknownGrpcError.js';
import { type GrpcStatus } from '../grpcStatus/models/GrpcStatus.js';
import { runGrpcHandlerList } from '../handler/actions/runGrpcHandlerList.js';
import { buildRpcParamsBuilder } from '../handler/calculations/buildRpcParamsBuilder.js';
import { describeRpcKind } from '../handler/calculations/describeRpcKind.js';
import { type GrpcChainHandler } from '../handler/models/GrpcChainHandler.js';
import { type GrpcHandlerListResult } from '../handler/models/GrpcHandlerListResult.js';
import { type RpcParamsBuilder } from '../handler/models/RpcParamsBuilder.js';
import { type GrpcServiceDefinition } from '../service/models/GrpcServiceDefinition.js';
import { type GrpcMethodHandler } from './models/GrpcMethodHandler.js';
import { grpcServerServiceIdentifier } from './models/grpcServerServiceIdentifier.js';
import { type GrpcServiceImplementation } from './models/GrpcServiceImplementation.js';
import { type InversifyGrpcAdapterOptions } from './models/InversifyGrpcAdapterOptions.js';

interface GrpcInvokeOutcome<TResult> {
  invoked: boolean;
  result: TResult | undefined;
}

type GrpcServiceMethod = (...args: unknown[]) => unknown;

type GrpcServiceInstance = Record<string | symbol, GrpcServiceMethod>;

export abstract class InversifyGrpcAdapter<
  TServer = unknown,
  TCall = unknown,
  TCallback = unknown,
  TResult = unknown,
> extends InversifyServerAdapter<
  TServer,
  TCall,
  TCall | TCallback,
  () => void,
  TResult
> {
  protected readonly _logger: Logger;
  protected readonly _server: TServer;
  readonly #options: InversifyGrpcAdapterOptions;

  constructor(
    container: Container,
    options?: InversifyGrpcAdapterOptions,
    customServer?: TServer,
  ) {
    super(container);

    this.#options = options ?? {};
    this._logger = this.#buildLogger(this.#options);

    this.#setGrpcErrorFilter();

    this._server = this._buildServer(customServer);
  }

  protected override _applyGlobalPreHandlerMiddleware(): void {
    // gRPC composes global pre-handler middleware into each RPC. There is no
    // server-level stack to install it on.
  }

  protected override _bindServices(): void {
    if (this._container.isBound(grpcServerServiceIdentifier)) {
      throw new InversifyGrpcAdapterError(
        InversifyGrpcAdapterErrorKind.serverAlreadyRegistered,
        'A gRPC server is already registered in the container',
      );
    }

    this._container
      .bind<TServer>(grpcServerServiceIdentifier)
      .toConstantValue(this._server);
  }

  protected override _getServer(): TServer {
    return this._server;
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

  protected override async _registerHandlers(): Promise<void> {
    const serviceMetadataList: GrpcExplorerServiceMetadata<
      TCall,
      TCall | TCallback
    >[] = buildGrpcExplorerServiceMetadataList<TCall, TCall | TCallback>(
      this._container,
      this._logger,
    );

    for (const serviceMetadata of serviceMetadataList) {
      const implementation: GrpcServiceImplementation<
        TCall,
        TCallback,
        TResult
      > = {};

      for (const rpcMetadata of serviceMetadata.rpcList) {
        implementation[rpcMetadata.name] = this.#buildRpcHandler(
          serviceMetadata,
          rpcMetadata,
        );
      }

      const addServiceResult: void | Promise<void> = this._addService(
        serviceMetadata.definition,
        implementation,
      );

      if (addServiceResult instanceof Promise) {
        await addServiceResult;
      }

      this.#printService(serviceMetadata);
    }
  }

  protected override _throwInvalidOperationAfterBuild(message: string): never {
    throw new InversifyGrpcAdapterError(
      InversifyGrpcAdapterErrorKind.invalidOperationAfterBuild,
      message,
    );
  }

  #buildGuardHandlers(
    handleError: (
      call: TCall,
      response: TCall | TCallback,
      error: unknown,
    ) => Promise<TResult | undefined>,
    guardList: readonly ServiceIdentifier<Guard<TCall>>[],
  ): GrpcChainHandler<TCall, TCall | TCallback, TResult>[] {
    return guardList.map(
      (
        guardServiceIdentifier: ServiceIdentifier<Guard<TCall>>,
      ): GrpcChainHandler<TCall, TCall | TCallback, TResult> => {
        return async (
          call: TCall,
          response: TCall | TCallback,
          next: () => void,
        ): Promise<TResult | undefined> => {
          try {
            const guard: Guard<TCall> = await this._container.getAsync(
              guardServiceIdentifier,
            );
            const isAllowed: boolean = await guard.activate(call);

            if (isAllowed) {
              next();

              return undefined;
            }

            return await this._sendStatus(
              call,
              response,
              new PermissionDeniedGrpcError(),
            );
          } catch (error: unknown) {
            return handleError(call, response, error);
          }
        };
      },
    );
  }

  #buildLogger(options: InversifyGrpcAdapterOptions): Logger {
    if (typeof options.logger === 'boolean' || options.logger === undefined) {
      return new ConsoleLogger();
    }

    return options.logger;
  }

  #buildMiddlewareHandlers(
    handleError: (
      call: TCall,
      response: TCall | TCallback,
      error: unknown,
    ) => Promise<TResult | undefined>,
    middlewareList: readonly ServiceIdentifier<
      Middleware<TCall, TCall | TCallback, () => void, TResult>
    >[],
  ): GrpcChainHandler<TCall, TCall | TCallback, TResult>[] {
    return middlewareList.map(
      (
        middlewareServiceIdentifier: ServiceIdentifier<
          Middleware<TCall, TCall | TCallback, () => void, TResult>
        >,
      ): GrpcChainHandler<TCall, TCall | TCallback, TResult> => {
        return async (
          call: TCall,
          response: TCall | TCallback,
          next: () => void,
        ): Promise<TResult | undefined> => {
          try {
            const middleware: Middleware<
              TCall,
              TCall | TCallback,
              () => void,
              TResult
            > = await this._container.getAsync(middlewareServiceIdentifier);

            return await middleware.execute(call, response, next);
          } catch (error: unknown) {
            return handleError(call, response, error);
          }
        };
      },
    );
  }

  #buildRpcHandler(
    serviceMetadata: GrpcExplorerServiceMetadata<TCall, TCall | TCallback>,
    rpcMetadata: GrpcExplorerRpcMetadata<TCall, TCall | TCallback>,
  ): GrpcMethodHandler<TCall, TCallback, TResult> {
    const handleError: (
      call: TCall,
      response: TCall | TCallback,
      error: unknown,
    ) => Promise<TResult | undefined> = async (
      call: TCall,
      response: TCall | TCallback,
      error: unknown,
    ): Promise<TResult | undefined> => {
      let errorFilter:
        ErrorFilter<unknown, TCall, TCall | TCallback, TResult> | undefined;

      try {
        errorFilter = await getErrorFilterForError(
          this._container,
          error,
          [
            rpcMetadata.errorDiscriminatorToErrorFilterMap,
            this._errorDiscriminatorToGlobalErrorFilterMap,
          ],
          [
            rpcMetadata.errorTypeToErrorFilterMap,
            this._errorTypeToGlobalErrorFilterMap,
          ],
        );
      } catch (errorFilterError: unknown) {
        this.#logUnhandledError(errorFilterError);

        return this.#sendUnknownStatus(call, response, error);
      }

      if (errorFilter === undefined) {
        return this.#sendUnknownStatus(call, response, error);
      }

      try {
        return await errorFilter.catch(error, call, response);
      } catch (filterError: unknown) {
        return handleError(call, response, filterError);
      }
    };

    const preHandlerList: GrpcChainHandler<
      TCall,
      TCall | TCallback,
      TResult
    >[] = [
      ...this.#buildMiddlewareHandlers(
        handleError,
        this._preHandlerMiddlewareList,
      ),
      ...this.#buildMiddlewareHandlers(
        handleError,
        rpcMetadata.preHandlerMiddlewareList,
      ),
      ...this.#buildGuardHandlers(handleError, this._globalGuardList),
      ...this.#buildGuardHandlers(handleError, rpcMetadata.guardList),
    ];
    const postHandlerList: GrpcChainHandler<
      TCall,
      TCall | TCallback,
      TResult
    >[] = [
      ...this.#buildMiddlewareHandlers(
        handleError,
        rpcMetadata.postHandlerMiddlewareList,
      ),
      ...this.#buildMiddlewareHandlers(
        handleError,
        this._postHandlerMiddlewareList,
      ),
    ];
    const runPreHandlerList:
      | ((
          call: TCall,
          response: TCall | TCallback,
        ) => Promise<GrpcHandlerListResult<TResult>>)
      | undefined =
      preHandlerList.length === 0
        ? undefined
        : runGrpcHandlerList(preHandlerList);
    const runPostHandlerList:
      | ((
          call: TCall,
          response: TCall | TCallback,
        ) => Promise<GrpcHandlerListResult<TResult>>)
      | undefined =
      postHandlerList.length === 0
        ? undefined
        : runGrpcHandlerList(postHandlerList);
    const invokeRpc: (
      call: TCall,
      callback: TCallback | undefined,
      response: TCall | TCallback,
    ) => Promise<GrpcInvokeOutcome<TResult>> = this.#buildRpcInvoker(
      serviceMetadata,
      rpcMetadata,
    );

    return async (
      call: TCall,
      callback?: TCallback,
    ): Promise<TResult | undefined> => {
      const response: TCall | TCallback = callback ?? call;

      if (runPreHandlerList !== undefined) {
        const preHandlerResult: GrpcHandlerListResult<TResult> =
          await runPreHandlerList(call, response);

        if (!preHandlerResult.completed) {
          return preHandlerResult.result;
        }
      }

      try {
        const outcome: GrpcInvokeOutcome<TResult> = await invokeRpc(
          call,
          callback,
          response,
        );

        if (!outcome.invoked) {
          return undefined;
        }

        if (runPostHandlerList !== undefined) {
          const postHandlerResult: GrpcHandlerListResult<TResult> =
            await runPostHandlerList(call, response);

          if (!postHandlerResult.completed) {
            return postHandlerResult.result;
          }
        }

        return outcome.result;
      } catch (error: unknown) {
        return handleError(call, response, error);
      }
    };
  }

  #buildRpcCaller(
    serviceMetadata: GrpcExplorerServiceMetadata<TCall, TCall | TCallback>,
    rpcMetadata: GrpcExplorerRpcMetadata<TCall, TCall | TCallback>,
  ): (
    call: TCall,
    callback: TCallback | undefined,
    response: TCall | TCallback,
  ) => Promise<unknown> {
    const methodKey: string | symbol = rpcMetadata.methodKey;
    const serviceIdentifier: ServiceIdentifier<GrpcServiceInstance> =
      serviceMetadata.serviceIdentifier as ServiceIdentifier<GrpcServiceInstance>;
    const buildParams: RpcParamsBuilder | undefined = buildRpcParamsBuilder(
      this._container,
      this._globalPipeList,
      serviceMetadata.target,
      methodKey,
      rpcMetadata.parameterMetadataList,
    );

    if (buildParams === undefined) {
      return async (
        call: TCall,
        callback: TCallback | undefined,
      ): Promise<unknown> => {
        const service: GrpcServiceInstance =
          await this._container.getAsync(serviceIdentifier);

        return (service[methodKey] as GrpcServiceMethod)(call, callback);
      };
    }

    return async (
      call: TCall,
      callback: TCallback | undefined,
      response: TCall | TCallback,
    ): Promise<unknown> => {
      const params: unknown[] = await buildParams(call, callback, response);
      const service: GrpcServiceInstance =
        await this._container.getAsync(serviceIdentifier);

      return (service[methodKey] as GrpcServiceMethod)(...params);
    };
  }

  #buildRpcInvoker(
    serviceMetadata: GrpcExplorerServiceMetadata<TCall, TCall | TCallback>,
    rpcMetadata: GrpcExplorerRpcMetadata<TCall, TCall | TCallback>,
  ): (
    call: TCall,
    callback: TCallback | undefined,
    response: TCall | TCallback,
  ) => Promise<GrpcInvokeOutcome<TResult>> {
    const callRpc: (
      call: TCall,
      callback: TCallback | undefined,
      response: TCall | TCallback,
    ) => Promise<unknown> = this.#buildRpcCaller(serviceMetadata, rpcMetadata);
    const sendsResponse: boolean = !rpcMetadata.useNativeHandler;
    const interceptorList: ServiceIdentifier<
      Interceptor<TCall, TCall | TCallback>
    >[] = [...rpcMetadata.interceptorList, ...this._globalInterceptorList];

    if (interceptorList.length === 0) {
      if (!sendsResponse) {
        return async (
          call: TCall,
          callback: TCallback | undefined,
          response: TCall | TCallback,
        ): Promise<GrpcInvokeOutcome<TResult>> => ({
          invoked: true,
          result: (await callRpc(call, callback, response)) as TResult,
        });
      }

      return async (
        call: TCall,
        callback: TCallback | undefined,
        response: TCall | TCallback,
      ): Promise<GrpcInvokeOutcome<TResult>> => {
        const value: unknown = await callRpc(call, callback, response);

        return {
          invoked: true,
          result:
            value === undefined
              ? undefined
              : await this._sendResponse(call, response, value),
        };
      };
    }

    return async (
      call: TCall,
      callback: TCallback | undefined,
      response: TCall | TCallback,
    ): Promise<GrpcInvokeOutcome<TResult>> => {
      const transforms: ((value: unknown) => unknown)[] = [];
      const transformObject: InterceptorTransformObject = {
        push: (transform: (value: unknown) => unknown): void => {
          transforms.push(transform);
        },
      };
      const methodOutcome: { invoked: boolean; value: unknown } = {
        invoked: false,
        value: undefined,
      };
      const nextAt: (
        index: number,
      ) => Promise<InterceptorTransformObject> = async (
        index: number,
      ): Promise<InterceptorTransformObject> => {
        const interceptorIdentifier:
          ServiceIdentifier<Interceptor<TCall, TCall | TCallback>> | undefined =
          interceptorList[index];

        if (interceptorIdentifier === undefined) {
          methodOutcome.value = await callRpc(call, callback, response);
          methodOutcome.invoked = true;

          return transformObject;
        }

        const interceptor: Interceptor<TCall, TCall | TCallback> =
          await this._container.getAsync(interceptorIdentifier);

        await interceptor.intercept(
          call,
          response,
          async (): Promise<InterceptorTransformObject> => nextAt(index + 1),
        );

        return transformObject;
      };

      await nextAt(0);

      if (!methodOutcome.invoked) {
        return {
          invoked: false,
          result: undefined,
        };
      }

      if (sendsResponse && methodOutcome.value === undefined) {
        return {
          invoked: true,
          result: undefined,
        };
      }

      let transformed: unknown = methodOutcome.value;

      for (const transform of transforms) {
        transformed = await transform(transformed);
      }

      return {
        invoked: true,
        result: sendsResponse
          ? await this._sendResponse(call, response, transformed)
          : (transformed as TResult),
      };
    };
  }

  #logUnhandledError(error: unknown): void {
    if (this.#options.logger === false) {
      return;
    }

    if (error instanceof Error) {
      this._logger.error(error.stack ?? error.message);

      return;
    }

    this._logger.error('Unhandled gRPC error');
  }

  #printService(
    serviceMetadata: GrpcExplorerServiceMetadata<TCall, TCall | TCallback>,
  ): void {
    if (this.#options.logger === false) {
      return;
    }

    this._logger.info(`${serviceMetadata.target.name}:`);

    for (const rpcMetadata of serviceMetadata.rpcList) {
      this._logger.info(
        `  - ${rpcMetadata.name}() {${describeRpcKind(rpcMetadata.methodDefinition)}}`,
      );
    }
  }

  async #sendUnknownStatus(
    call: TCall,
    response: TCall | TCallback,
    error: unknown,
  ): Promise<TResult | undefined> {
    this.#logUnhandledError(error);

    try {
      return await this._sendStatus(
        call,
        response,
        new UnknownGrpcError(undefined, { cause: error }),
      );
    } catch (sendStatusError: unknown) {
      this.#logUnhandledError(sendStatusError);

      return undefined;
    }
  }

  #setGrpcErrorFilter(): void {
    this._errorTypeToGlobalErrorFilterMap.set(
      GrpcError,
      buildGrpcErrorFilter(this._sendStatus.bind(this)),
    );
  }

  protected abstract _addService(
    definition: GrpcServiceDefinition,
    implementation: GrpcServiceImplementation<TCall, TCallback, TResult>,
  ): void | Promise<void>;

  protected abstract _buildServer(customServer: TServer | undefined): TServer;

  // Only called for unary and client-streaming RPCs whose method does not use
  // @Callback() and returns a value. The call may already have ended, for
  // example after the client cancelled. Implementations must not throw in that
  // case.
  protected abstract _sendResponse(
    call: TCall,
    response: TCall | TCallback,
    message: unknown,
  ): Promise<TResult> | TResult;

  // The call may already have ended, for example after the client cancelled or
  // the RPC already replied. Implementations must not throw in that case.
  protected abstract _sendStatus(
    call: TCall,
    response: TCall | TCallback,
    status: GrpcStatus,
  ): Promise<TResult> | TResult;
}
