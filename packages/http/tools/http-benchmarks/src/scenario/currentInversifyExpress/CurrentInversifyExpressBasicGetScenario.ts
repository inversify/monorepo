import { controller, GET } from '@inversifyjs/http-core';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { Container } from 'inversify';

import { CurrentInversifyExpressBaseScenario } from './CurrentInversifyExpressBaseScenario';

@controller()
class AppController {
  @GET()
  public ok(): string {
    return 'ok';
  }
}

export class CurrentInversifyExpressBasicGetScenario extends CurrentInversifyExpressBaseScenario {
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

    const server: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(
      container,
      {
        logger: false,
      },
    );

    this._app = await server.build();

    this._server = this._app.listen(this._port);
  }
}
