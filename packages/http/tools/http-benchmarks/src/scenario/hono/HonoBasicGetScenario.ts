import { serve } from '@hono/node-server';
import { Context } from 'hono';

import { HonoBaseScenario } from './HonoBaseScenario';

export class HonoBasicGetScenario extends HonoBaseScenario {
  public async execute(): Promise<void> {
    try {
      await fetch(`http://localhost:${String(this._port)}`);
    } catch {
      void 0;
    }
  }

  public async setUp(): Promise<void> {
    this._app.get('/', (ctx: Context) => {
      return ctx.text('ok');
    });

    this._server = serve({
      fetch: this._app.fetch,
      port: this._port,
    });
  }
}
