import { Scenario } from '@inversifyjs/benchmark-utils';
import {
  INestApplicationContext,
  Injectable,
  Module,
  Scope,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { Platform } from '../models/Platform';

@Injectable({
  scope: Scope.TRANSIENT,
})
class Katana {
  public hit() {
    return 'cut!';
  }
}

@Injectable({
  scope: Scope.TRANSIENT,
})
class Samurai {
  readonly #katana: Katana;

  constructor(katana: Katana) {
    this.#katana = katana;
  }

  public attack() {
    return this.#katana.hit();
  }
}

@Module({
  exports: [Samurai],
  providers: [Katana, Samurai],
})
class ContainerModule {}

export class NestCoreGetServiceInTransientScopeScenario implements Scenario<Platform> {
  public readonly platform: Platform;

  #context!: INestApplicationContext;

  constructor() {
    this.platform = Platform.nestJs;
  }

  public async setUp(): Promise<void> {
    this.#context = await NestFactory.createApplicationContext(
      ContainerModule,
      { logger: false },
    );
  }

  public async tearDown(): Promise<void> {
    await this.#context.close();
  }

  public async execute(): Promise<void> {
    await this.#context.resolve(Samurai);
  }
}
