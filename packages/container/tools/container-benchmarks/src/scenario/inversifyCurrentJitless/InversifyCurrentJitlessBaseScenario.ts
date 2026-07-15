import { type Scenario } from '@inversifyjs/benchmark-utils';
import { Container } from '@inversifyjs/container';

import { Platform } from '../models/Platform.js';

export abstract class InversifyCurrentJitlessBaseScenario implements Scenario {
  public readonly name: string;

  protected readonly _container: Container;

  constructor(name?: string) {
    this._container = new Container({
      jitless: true,
    });
    this.name = name ?? Platform.inversifyCurrentJitless;
  }

  public async setUp(): Promise<void> {
    return undefined;
  }

  public async tearDown(): Promise<void> {
    return undefined;
  }

  public abstract execute(): Promise<void>;
}
