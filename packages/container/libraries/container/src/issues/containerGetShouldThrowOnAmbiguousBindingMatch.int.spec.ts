import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { inject, injectable } from '@inversifyjs/core';

import { Container } from '../container/services/Container';

describe('Container.get should throw on ambiguous binding match', () => {
  @injectable()
  class Katana {
    public hit() {
      return 'cut!';
    }
  }

  @injectable()
  class Samurai {
    readonly #katana: Katana;

    constructor(@inject(Katana) katana: Katana) {
      this.#katana = katana;
    }

    public attack() {
      return this.#katana.hit();
    }
  }

  let result: unknown;

  beforeAll(() => {
    const container: Container = new Container();

    container.bind(Katana).toSelf().inSingletonScope();
    container.bind(Samurai).toSelf().inSingletonScope();
    container.bind(Katana).toSelf().inSingletonScope();
    container.bind(Samurai).toSelf().inSingletonScope();

    try {
      container.get(Samurai);
    } catch (error: unknown) {
      result = error;
    }
  });

  it('should throw an error', () => {
    expect(result).toBeInstanceOf(Error);
  });
});
