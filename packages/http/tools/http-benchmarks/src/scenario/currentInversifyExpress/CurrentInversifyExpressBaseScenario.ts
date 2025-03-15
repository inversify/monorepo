import { Scenario } from '@inversifyjs/benchmark-utils';
import { Application } from 'express';
import { Server } from 'http';

import { Platform } from '../models/Platform';

export abstract class CurrentInversifyExpressBaseScenario
  implements Scenario<Platform>
{
  public readonly platform: Platform;

  protected _app!: Application;
  protected _server!: Server;
  protected readonly _port: number;

  constructor() {
    this.platform = Platform.currentInversifyExpress;
    this._port = 3005;
  }

  public async tearDown(): Promise<void> {
    this._server.close();
  }

  public abstract execute(): Promise<void>;

  public abstract setUp(): Promise<void>;
}
