import { type sendUnaryData, Server, type ServerOptions } from '@grpc/grpc-js';
import {
  type GrpcServiceDefinition,
  type GrpcServiceImplementation,
  type GrpcStatus,
  InversifyGrpcAdapter,
} from '@inversifyjs/grpc-core';
import { type Container } from 'inversify';

import { type GrpcJsCall } from '../models/GrpcJsCall.js';
import { type InversifyGrpcJsAdapterOptions } from '../models/InversifyGrpcJsAdapterOptions.js';
import {
  buildGrpcJsStatusResponse,
  type GrpcJsStatusBuild,
} from '../status/calculations/buildGrpcJsStatusResponse.js';
import { type GrpcJsStatusResponse } from '../status/models/GrpcJsStatusResponse.js';

function buildGrpcJsServer(
  customServer: Server | undefined,
  serverOptions?: ServerOptions,
): Server {
  if (customServer !== undefined) {
    return customServer;
  }

  return new Server(serverOptions);
}

function isCallback(
  response: GrpcJsCall | sendUnaryData<unknown>,
): response is sendUnaryData<unknown> {
  return typeof response === 'function';
}

export class InversifyGrpcJsAdapter extends InversifyGrpcAdapter<
  Server,
  GrpcJsCall,
  sendUnaryData<unknown>,
  void
> {
  readonly #options: InversifyGrpcJsAdapterOptions;

  constructor(
    container: Container,
    options?: InversifyGrpcJsAdapterOptions,
    customServer?: Server,
  ) {
    super(
      container,
      options,
      buildGrpcJsServer(customServer, options?.serverOptions),
    );

    this.#options = options ?? {};
  }

  protected override _addService(
    definition: GrpcServiceDefinition,
    implementation: GrpcServiceImplementation<
      GrpcJsCall,
      sendUnaryData<unknown>,
      void
    >,
  ): void {
    this._server.addService(definition, implementation);
  }

  protected override _buildServer(customServer: Server | undefined): Server {
    return buildGrpcJsServer(customServer);
  }

  protected override _sendResponse(
    _call: GrpcJsCall,
    response: GrpcJsCall | sendUnaryData<unknown>,
    message: unknown,
  ): void {
    if (!isCallback(response)) {
      return;
    }

    this.#runCallEndedSafe((): void => {
      response(null, message);
    });
  }

  protected override _sendStatus(
    call: GrpcJsCall,
    response: GrpcJsCall | sendUnaryData<unknown>,
    grpcStatus: GrpcStatus,
  ): void {
    const statusResponse: GrpcJsStatusResponse =
      this.#buildStatusResponse(grpcStatus);

    if (isCallback(response)) {
      this.#runCallEndedSafe((): void => {
        response(statusResponse);
      });

      return;
    }

    this.#runCallEndedSafe((): void => {
      call.emit('error', statusResponse);
    });
  }

  #buildStatusResponse(grpcStatus: GrpcStatus): GrpcJsStatusResponse {
    const statusBuild: GrpcJsStatusBuild =
      buildGrpcJsStatusResponse(grpcStatus);

    for (const error of statusBuild.errors) {
      this.#logFailure(error);
    }

    return statusBuild.statusResponse;
  }

  #logFailure(error: unknown): void {
    if (this.#options.logger === false) {
      return;
    }

    if (error instanceof Error) {
      this._logger.error(error.stack ?? error.message);

      return;
    }

    this._logger.error('Failed to end the gRPC call');
  }

  #runCallEndedSafe(send: () => void): void {
    try {
      send();
    } catch (error: unknown) {
      this.#logFailure(error);
    }
  }
}
