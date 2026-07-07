import { type Scenario } from '@inversifyjs/benchmark-utils';
import { Container } from '@inversifyjs/container';

import { Platform } from '../models/Platform.js';

export abstract class InversifyCurrentBaseScenario implements Scenario {
  public readonly name: string;

  protected readonly _container: Container;

  constructor(name?: string) {
    this._container = new Container();
    this.name = name ?? Platform.inversifyCurrent;
  }

  public async setUp(): Promise<void> {
    return undefined;
  }

  public async tearDown(): Promise<void> {
    return undefined;
  }

  public abstract execute(): Promise<void>;
}
