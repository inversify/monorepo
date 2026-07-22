import { type Scenario } from '@inversifyjs/benchmark-utils';
import { Container } from 'inversify8';

import { Platform } from '../models/Platform.js';

export abstract class Inversify8JitlessBaseScenario implements Scenario<Platform> {
  public readonly name: Platform;

  protected readonly _container: Container;

  constructor() {
    this._container = new Container({
      jitless: true,
    });
    this.name = Platform.inversify8Jitless;
  }

  public async setUp(): Promise<void> {
    return undefined;
  }

  public async tearDown(): Promise<void> {
    return undefined;
  }

  public abstract execute(): Promise<void>;
}
