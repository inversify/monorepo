import { AddressInfo } from 'node:net';

import { InversifyFastifyHttpAdapter } from '@inversifyjs/http-fastify';
import { FastifyInstance } from 'fastify';
import { Container } from 'inversify';

import { Server } from '../../../models/Server';

export async function buildFastifyServer(
  container: Container,
): Promise<Server> {
  const adapter: InversifyFastifyHttpAdapter = new InversifyFastifyHttpAdapter(
    container,
    {
      logger: true,
      useCookies: true,
      useFormUrlEncoded: true,
      useMultipartFormData: true,
    },
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
