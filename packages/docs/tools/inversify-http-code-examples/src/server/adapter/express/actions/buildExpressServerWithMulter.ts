import http, { RequestListener } from 'node:http';
import { AddressInfo } from 'node:net';

import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import express from 'express';
import { Container } from 'inversify';
import multer from 'multer';

import { Server } from '../../../models/Server';

export async function buildExpressServerWithMulter(
  container: Container,
): Promise<Server> {
  const app: express.Application = express();

  // Configure multer to handle multipart/form-data
  const upload: multer.Multer = multer();
  app.use(upload.any());

  const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(
    container,
    {
      logger: true,
      useCookies: true,
      useJson: true,
      useText: true,
      useUrlEncoded: true,
    },
    app,
  );

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
