import 'reflect-metadata/lite';
import { beforeAll, describe, expect, it } from 'vitest';

import { type Inject, type Injectable } from '@inversifyjs/core';

import { Container } from '../container/services/Container.js';

describe('Container.get should throw on ambiguous binding match', () => {
  class Katana implements Injectable {
    public hit() {
      return 'cut!';
    }
  }

  class Samurai implements Injectable {
    readonly #katana: Katana;

    constructor(katana: Inject<Katana>) {
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
