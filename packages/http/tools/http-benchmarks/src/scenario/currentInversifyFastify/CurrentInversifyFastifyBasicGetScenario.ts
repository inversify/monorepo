import { controller, GET } from '@inversifyjs/http-core';
import { InversifyFastifyHttpAdapter } from '@inversifyjs/http-fastify';
import { Container } from 'inversify';

import { CurrentInversifyFastifyBaseScenario } from './CurrentInversifyFastifyBaseScenario';

@controller()
class AppController {
  @GET()
  public ok(): string {
    return 'ok';
  }
}

export class CurrentInversifyFastifyBasicGetScenario extends CurrentInversifyFastifyBaseScenario {
  public override async execute(): Promise<void> {
    try {
      await fetch(`http://localhost:${String(this._port)}`);
    } catch {
      void 0;
    }
  }

  public override async setUp(): Promise<void> {
    const container: Container = new Container({ defaultScope: 'Singleton' });

    container.bind(AppController).toSelf();

    const server: InversifyFastifyHttpAdapter = new InversifyFastifyHttpAdapter(
      container,
      {
        logger: false,
      },
    );

    this._app = await server.build();

    await this._app.listen({ port: this._port });
  }
}
