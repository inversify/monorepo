import { type Scenario } from '@inversifyjs/benchmark-utils';
import { type AwilixContainer, createContainer, InjectionMode } from 'awilix';

import { Platform } from '../models/Platform.js';

export abstract class AwilixBaseScenario implements Scenario<string> {
  public readonly name: Platform;

  protected readonly _container: AwilixContainer;

  constructor() {
    this._container = createContainer({
      injectionMode: InjectionMode.CLASSIC,
    });
    this.name = Platform.awilix;
  }

  public async setUp(): Promise<void> {
    return undefined;
  }

  public async tearDown(): Promise<void> {
    return undefined;
  }

  public abstract execute(): Promise<void>;
}
