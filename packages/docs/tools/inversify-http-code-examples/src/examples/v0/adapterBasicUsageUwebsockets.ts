// Shift-line-spaces-2
/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { InversifyUwebSocketsHttpAdapter } from '@inversifyjs/http-uwebsockets';
import { Container } from 'inversify';
import { us_socket_local_port } from 'uWebSockets.js';

export async function adapterBasicUsageUwebsockets(): Promise<void> {
  // Begin-example
  // Create your container and bind controllers
  const container: Container = new Container();
  // ... bind your controllers, services, etc.

  // Create the adapter with options
  const adapter: InversifyUwebSocketsHttpAdapter =
    new InversifyUwebSocketsHttpAdapter(container, {
      logger: true,
    });

  // Build the uWebSockets application
  const app = await adapter.build();

  // Start the server
  app.listen('0.0.0.0', 3000, (socket) => {
    if (socket !== false) {
      const port: number = us_socket_local_port(socket);
      console.log(`Server listening on port ${String(port)}`);
    } else {
      console.error('Failed to start server');
    }
  });
  // End-example
}
