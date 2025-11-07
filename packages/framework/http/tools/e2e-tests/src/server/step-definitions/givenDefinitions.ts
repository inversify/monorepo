import http, { RequestListener } from 'node:http';
import { AddressInfo } from 'node:net';

import { Given } from '@cucumber/cucumber';
import { serve, ServerType } from '@hono/node-server';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { InversifyExpressHttpAdapter as InversifyExpress4HttpAdapter } from '@inversifyjs/http-express-v4';
import { InversifyFastifyHttpAdapter } from '@inversifyjs/http-fastify';
import { InversifyHonoHttpAdapter } from '@inversifyjs/http-hono';
import { InversifyUwebSocketsHttpAdapter } from '@inversifyjs/http-uwebsockets';
import express from 'express';
import express4 from 'express4';
import { FastifyInstance } from 'fastify';
import { Hono } from 'hono';
import { Container } from 'inversify';
import { us_socket_local_port } from 'uWebSockets.js';

import { defaultAlias } from '../../common/models/defaultAlias';
import { InversifyHttpWorld } from '../../common/models/InversifyHttpWorld';
import { getContainerOrFail } from '../../container/calculations/getContainerOrFail';
import { setServer } from '../actions/setServer';
import { Server } from '../models/Server';
import { ServerKind } from '../models/ServerKind';

async function buildExpressServer(container: Container): Promise<Server> {
  const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(
    container,
    { logger: true, useJson: true, useText: true, useUrlEncoded: true },
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

async function buildExpress4Server(container: Container): Promise<Server> {
  const adapter: InversifyExpress4HttpAdapter =
    new InversifyExpress4HttpAdapter(container, {
      logger: true,
      useJson: true,
      useText: true,
      useUrlEncoded: true,
    });

  const application: express4.Application = await adapter.build();
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

async function buildHonoServer(container: Container): Promise<Server> {
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

async function buildFastifyServer(container: Container): Promise<Server> {
  const adapter: InversifyFastifyHttpAdapter = new InversifyFastifyHttpAdapter(
    container,
    { logger: true, useFormUrlEncoded: true, useMultipartFormData: true },
  );

  const application: FastifyInstance = await adapter.build();

  await application.listen({ host: '0.0.0.0', port: 0 });

  const address: AddressInfo | string | null = application.server.address();

  if (address === null || typeof address === 'string') {
    throw new Error('Failed to get server address');
  }

  return {
    host: address.address,
    port: address.port,
    shutdown: async (): Promise<void> => {
      await new Promise<void>(
        (
          resolve: (value: void | PromiseLike<void>) => void,
          reject: (reason?: unknown) => void,
        ) => {
          application.close().then(
            () => {
              resolve();
            },
            (err: unknown) => {
              if (err === undefined) {
                resolve();
              } else {
                // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                reject(err);
              }
            },
          );
        },
      );
    },
  };
}

async function buildUwebSocketsJsServer(container: Container): Promise<Server> {
  const adapter: InversifyUwebSocketsHttpAdapter =
    new InversifyUwebSocketsHttpAdapter(container, {
      logger: true,
    });

  // eslint-disable-next-line @typescript-eslint/typedef
  const application = await adapter.build();

  return new Promise<Server>(
    (resolve: (value: Server | PromiseLike<Server>) => void) => {
      // eslint-disable-next-line @typescript-eslint/typedef
      application.listen('127.0.0.1', 0, (socket) => {
        const server: Server = {
          host: '127.0.0.1',
          port: us_socket_local_port(socket),
          shutdown: async (): Promise<void> => {
            application.close();
          },
        };

        resolve(server);
      });
    },
  );
}

async function givenServer(
  this: InversifyHttpWorld,
  serverKind: ServerKind,
  containerAlias?: string,
  serverAlias?: string,
): Promise<void> {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;
  const parsedServerAlias: string = serverAlias ?? defaultAlias;

  const container: Container =
    getContainerOrFail.bind(this)(parsedContainerAlias);

  let server: Server;

  switch (serverKind) {
    case ServerKind.express: {
      server = await buildExpressServer(container);
      break;
    }
    case ServerKind.express4: {
      server = await buildExpress4Server(container);
      break;
    }
    case ServerKind.hono: {
      server = await buildHonoServer(container);
      break;
    }
    case ServerKind.fastify: {
      server = await buildFastifyServer(container);
      break;
    }
    case ServerKind.uwebsockets: {
      server = await buildUwebSocketsJsServer(container);
    }
  }

  setServer.bind(this)(parsedServerAlias, server);
}

Given<InversifyHttpWorld>(
  'a(n) "{serverKind}" server from container',
  async function (serverKind: ServerKind): Promise<void> {
    await givenServer.bind(this)(serverKind);
  },
);
