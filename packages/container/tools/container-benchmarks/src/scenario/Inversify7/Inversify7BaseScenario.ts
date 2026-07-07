import { type Scenario } from '@inversifyjs/benchmark-utils';
import { Container } from 'inversify7';

import { Platform } from '../models/Platform.js';

export abstract class Inversify7BaseScenario implements Scenario<Platform> {
  public readonly name: Platform;

  protected readonly _container: Container;

  constructor() {
    this._container = new Container();
    this.name = Platform.inversify7;
  }

  public async setUp(): Promise<void> {
    return undefined;
  }

  public async tearDown(): Promise<void> {
    return undefined;
  }

  public abstract execute(): Promise<void>;
}
