// Shift-line-spaces-2
import { InversifyFastifyHttpAdapter } from '@inversifyjs/http-fastify';
import { FastifyInstance } from 'fastify';
import { Container } from 'inversify';

export async function adapterBasicUsageFastify(): Promise<void> {
  // Begin-example
  // Create your container and bind controllers
  const container: Container = new Container();
  // ... bind your controllers, services, etc.

  // Create the adapter with options
  const adapter: InversifyFastifyHttpAdapter = new InversifyFastifyHttpAdapter(
    container,
    {
      logger: true,
      useCookies: true,
      useFormUrlEncoded: true,
      useMultipartFormData: true,
    },
  );

  // Build the Fastify instance
  const app: FastifyInstance = await adapter.build();

  // Start the server
  await app.listen({ host: '0.0.0.0', port: 3000 });
  console.log('Server listening on port 3000');
  // End-example
}
