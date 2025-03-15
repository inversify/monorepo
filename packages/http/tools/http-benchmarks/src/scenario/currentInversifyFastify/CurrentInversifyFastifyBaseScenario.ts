import { Scenario } from '@inversifyjs/benchmark-utils';
import { FastifyInstance } from 'fastify';

import { Platform } from '../models/Platform';

export abstract class CurrentInversifyFastifyBaseScenario
  implements Scenario<Platform>
{
  public readonly platform: Platform;

  protected _app!: FastifyInstance;
  protected readonly _port: number;

  constructor() {
    this.platform = Platform.currentInversifyFastify;
    this._port = 3006;
  }

  public async tearDown(): Promise<void> {
    await this._app.close();
  }

  public abstract execute(): Promise<void>;

  public abstract setUp(): Promise<void>;
}
