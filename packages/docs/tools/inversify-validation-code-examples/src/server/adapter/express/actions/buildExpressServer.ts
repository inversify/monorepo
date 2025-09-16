import http, { RequestListener } from 'node:http';
import { AddressInfo } from 'node:net';

import { ErrorFilter, Pipe } from '@inversifyjs/http-core';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import express from 'express';
import { Container, Newable } from 'inversify';

import { Server } from '../../../models/Server';

export async function buildExpressServer(
  container: Container,
  errorFilterList: Newable<ErrorFilter>[],
  pipeList: (Newable<Pipe> | Pipe)[],
): Promise<Server> {
  const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(
    container,
    {
      logger: true,
      useCookies: true,
    },
  );

  adapter.useGlobalFilters(...errorFilterList);
  adapter.useGlobalPipe(...pipeList);

  const application: express.Application = await adapter.build();

  const httpServer: http.Server = http.createServer(
    application as RequestListener,
  );

  return new Promise<Server>(
    (resolve: (value: Server | PromiseLike<Server>) => void) => {
      httpServer.listen(0, '127.0.0.1', () => {
        const address: AddressInfo | string | null = httpServer.address();

        if (address === null || typeof address === 'string') {
          throw new Error('Failed to get server address');
        }

        const server: Server = {
          host: address.address,
          port: address.port,
          shutdown: async (): Promise<void> => {
            await new Promise<void>(
              (
                resolve: (value: void | PromiseLike<void>) => void,
                reject: (reason?: unknown) => void,
              ) => {
                httpServer.close((error: Error | undefined) => {
                  if (error !== undefined) {
                    reject(error);
                  } else {
                    resolve();
                  }
                });
              },
            );
          },
        };

        resolve(server);
      });
    },
  );
}
