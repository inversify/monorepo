import { type Scenario } from '@inversifyjs/benchmark-utils';

import { Platform } from '../models/Platform.js';

export abstract class TsyringeBaseScenario implements Scenario<Platform> {
  public readonly name: Platform;

  constructor() {
    this.name = Platform.tsyringe;
  }

  public async setUp(): Promise<void> {
    return undefined;
  }

  public async tearDown(): Promise<void> {
    return undefined;
  }

  public abstract execute(): Promise<void>;
}
