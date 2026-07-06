import { Scenario } from '@inversifyjs/benchmark-utils';
import { Container } from 'inversify6';

import { Platform } from '../models/Platform';

export abstract class Inversify6BaseScenario implements Scenario<Platform> {
  public readonly name: Platform;

  protected readonly _container: Container;

  constructor() {
    this._container = new Container();
    this.name = Platform.inversify6;
  }

  public async setUp(): Promise<void> {
    return undefined;
  }

  public async tearDown(): Promise<void> {
    return undefined;
  }

  public abstract execute(): Promise<void>;
}
