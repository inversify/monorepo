import { ServerType } from '@hono/node-server';
import { Scenario } from '@inversifyjs/benchmark-utils';
import { Hono } from 'hono';

import { Platform } from '../models/Platform';

export abstract class CurrentInversifyHonoBaseScenario
  implements Scenario<Platform>
{
  public readonly platform: Platform;

  protected _app!: Hono;
  protected _server!: ServerType;
  protected readonly _port: number;

  constructor() {
    this.platform = Platform.currentInversifyHono;
    this._port = 3006;
  }

  public async tearDown(): Promise<void> {
    this._server.close();
  }

  public abstract execute(): Promise<void>;

  public abstract setUp(): Promise<void>;
}
