import { InversifyFastifyHttpAdapter } from '@inversifyjs/http-fastify';
import { FastifyInstance } from 'fastify';
import { bindingScopeValues, Container } from 'inversify';

import { DEFAULT_PORT } from '../../constant/defaultPort';
import { AppController } from '../../scenario/currentInversify/AppController';

async function setUp(): Promise<void> {
  const container: Container = new Container({
    defaultScope: bindingScopeValues.Singleton,
  });

  container.bind(AppController).toSelf();

  const server: InversifyFastifyHttpAdapter = new InversifyFastifyHttpAdapter(
    container,
    {
      logger: false,
      useCookies: false,
      useFormUrlEncoded: false,
      useMultipartFormData: false,
    },
  );

  const app: FastifyInstance = await server.build();

  await app.listen({ host: '0.0.0.0', port: DEFAULT_PORT });
}

void setUp();
