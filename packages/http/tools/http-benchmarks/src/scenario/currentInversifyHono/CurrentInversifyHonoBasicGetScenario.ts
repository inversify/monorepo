import { serve } from '@hono/node-server';
import { InversifyHonoHttpAdapter } from '@inversifyjs/http-hono';
import { Container } from 'inversify';

import { AppController } from '../currentInversify/AppController';
import { CurrentInversifyHonoBaseScenario } from './CurrentInversifyHonoBaseScenario';

export class CurrentInversifyHonoBasicGetScenario extends CurrentInversifyHonoBaseScenario {
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

    const adapter: InversifyHonoHttpAdapter = new InversifyHonoHttpAdapter(
      container,
      {
        logger: false,
      },
    );

    this._app = await adapter.build();

    this._server = serve({
      fetch: this._app.fetch,
      port: this._port,
    });
  }
}
