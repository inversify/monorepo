import { Scenario } from '@inversifyjs/benchmark-utils';
import { Container } from 'inversify8';

import { Platform } from '../models/Platform';

export abstract class Inversify8BaseScenario implements Scenario<Platform> {
  public readonly name: Platform;

  protected readonly _container: Container;

  constructor() {
    this._container = new Container();
    this.name = Platform.inversify8;
  }

  public async setUp(): Promise<void> {
    return undefined;
  }

  public async tearDown(): Promise<void> {
    return undefined;
  }

  public abstract execute(): Promise<void>;
}
