import { AddressInfo } from 'node:net';

import { serve, ServerType } from '@hono/node-server';
import { InversifyHonoHttpAdapter } from '@inversifyjs/http-hono';
import { Hono } from 'hono';
import { Container } from 'inversify';

import { Server } from '../../../models/Server';

export async function buildHonoServer(container: Container): Promise<Server> {
  const adapter: InversifyHonoHttpAdapter = new InversifyHonoHttpAdapter(
    container,
    { logger: true },
  );

  const application: Hono = await adapter.build();

  return new Promise<Server>(
    (resolve: (value: Server | PromiseLike<Server>) => void) => {
      const httpServer: ServerType = serve(
        {
          fetch: application.fetch,
          hostname: '0.0.0.0',
          port: 0,
        },
        (info: AddressInfo) => {
          const server: Server = {
            host: info.address,
            port: info.port,
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
        },
      );
    },
  );
}
