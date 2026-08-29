import 'reflect-metadata/lite';
import { beforeAll, describe, expect, it } from 'vitest';

import { bindingScopeValues, type Injectable } from '@inversifyjs/core';

import { Container } from '../container/services/Container.js';

class AsyncDependency {
  public static async create(): Promise<AsyncDependency> {
    return new AsyncDependency();
  }
}

class Dependency1 implements Injectable {
  constructor(
    public readonly asyncDependency: AsyncDependency,
  ) {}
}

class Dependency2 implements Injectable {
  constructor(
    public readonly asyncDependency: AsyncDependency,
  ) {}
}

class Application implements Injectable {
  constructor(
    public readonly dependency1: Dependency1,
    public readonly dependency2: Dependency2,
  ) {}
}

describe('Container.get should not instantiate async singleton bindings twice', () => {
  let result: unknown;

  beforeAll(async () => {
    const container: Container = new Container({
      defaultScope: bindingScopeValues.Singleton,
    });

    container.bind(Application).toSelf();
    container.bind(Dependency1).toSelf();
    container.bind(Dependency2).toSelf();
    container
      .bind(AsyncDependency)
      .toDynamicValue(async () => AsyncDependency.create());

    result = await container.getAsync(Application);
  });

  it('should return expected value', () => {
    expect(result).toBeInstanceOf(Application);

    expect((result as Application).dependency1.asyncDependency).toBe(
      (result as Application).dependency2.asyncDependency,
    );
  });
});
