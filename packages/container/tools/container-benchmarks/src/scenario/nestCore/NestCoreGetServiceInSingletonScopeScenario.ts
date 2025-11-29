import { Scenario } from '@inversifyjs/benchmark-utils';
import { INestApplicationContext, Injectable, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { Platform } from '../models/Platform';

@Injectable()
class Katana {
  public hit() {
    return 'cut!';
  }
}

@Injectable()
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

export class NestCoreGetServiceInSingletonScopeScenario implements Scenario<Platform> {
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
    this.#context.get(Samurai);
  }
}
