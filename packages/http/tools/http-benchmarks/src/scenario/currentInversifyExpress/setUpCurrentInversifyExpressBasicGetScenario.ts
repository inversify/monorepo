import { controller, GET } from '@inversifyjs/http-core';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { Application } from 'express';
import { Container } from 'inversify';

@controller()
class AppController {
  @GET()
  public ok(): string {
    return 'ok';
  }
}

async function setUp(): Promise<void> {
  const container: Container = new Container({ defaultScope: 'Singleton' });

  container.bind(AppController).toSelf();

  const server: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(
    container,
    {
      logger: false,
    },
  );

  const app: Application = await server.build();

  app.listen(3000);
}

void setUp();
