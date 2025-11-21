import { InversifyUwebSocketsHttpAdapter } from '@inversifyjs/http-uwebsockets';
import { Container } from 'inversify';
import { us_socket_local_port } from 'uWebSockets.js';

import { Server } from '../../../models/Server';

export async function buildUwebSocketsJsServer(
  container: Container,
): Promise<Server> {
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
