import { Given } from '@cucumber/cucumber';
import { Server as GrpcJsServer, ServerCredentials } from '@grpc/grpc-js';
import { InversifyGrpcJsAdapter } from '@inversifyjs/grpc-js';
import { Container } from 'inversify';

import { defaultAlias } from '../../common/models/defaultAlias.js';
import { InversifyGrpcWorld } from '../../common/models/InversifyGrpcWorld.js';
import { getContainerOrFail } from '../../container/calculations/getContainerOrFail.js';
import { setServer } from '../actions/setServer.js';
import { Server } from '../models/Server.js';

async function bindServer(server: GrpcJsServer): Promise<number> {
  return new Promise<number>(
    (resolve: (port: number) => void, reject: (error: Error) => void): void => {
      server.bindAsync(
        '127.0.0.1:0',
        ServerCredentials.createInsecure(),
        (error: Error | null, port: number): void => {
          if (error !== null) {
            reject(error);

            return;
          }

          resolve(port);
        },
      );
    },
  );
}

async function buildGrpcJsServer(container: Container): Promise<Server> {
  const adapter: InversifyGrpcJsAdapter = new InversifyGrpcJsAdapter(
    container,
    {
      logger: false,
    },
  );
  const grpcServer: GrpcJsServer = await adapter.build();
  const port: number = await bindServer(grpcServer);
  const server: Server = {
    host: '127.0.0.1',
    port,
    shutdown: async (): Promise<void> => {
      await new Promise<void>(
        (resolve: () => void, reject: (error: Error) => void): void => {
          grpcServer.tryShutdown((shutdownError?: Error): void => {
            if (shutdownError !== undefined) {
              reject(shutdownError);

              return;
            }

            resolve();
          });
        },
      );
    },
  };

  return server;
}

async function givenGrpcJsServer(this: InversifyGrpcWorld): Promise<void> {
  const container: Container = getContainerOrFail.bind(this)(defaultAlias);
  const server: Server = await buildGrpcJsServer(container);

  setServer.bind(this)(defaultAlias, server);
}

Given<InversifyGrpcWorld>(
  'a grpc-js server from container',
  async function (): Promise<void> {
    await givenGrpcJsServer.bind(this)();
  },
);
