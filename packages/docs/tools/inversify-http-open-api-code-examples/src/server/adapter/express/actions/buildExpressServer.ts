import http, { RequestListener } from 'node:http';
import { AddressInfo } from 'node:net';

import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { SwaggerUiProvider } from '@inversifyjs/http-open-api';
import express from 'express';
import { Container } from 'inversify';

import { Server } from '../../../models/Server';

export async function buildExpressServer(
  container: Container,
): Promise<Server> {
  const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(
    container,
    {
      logger: true,
      useCookies: true,
    },
  );

  const swaggerProvider: SwaggerUiProvider = new SwaggerUiProvider({
    api: {
      openApiObject: {
        info: {
          title: 'My awesome API',
          version: '1.0.0',
        },
        openapi: '3.1.1',
      },
      path: '/docs',
    },
    ui: {
      title: 'My awesome API docs',
    },
  });

  swaggerProvider.provide(container);

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
