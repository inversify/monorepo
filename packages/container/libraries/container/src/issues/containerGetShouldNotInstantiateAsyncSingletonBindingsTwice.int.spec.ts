import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { bindingScopeValues, inject, injectable } from '@inversifyjs/core';

import { Container } from '../container/services/Container';

class AsyncDependency {
  public static async create(): Promise<AsyncDependency> {
    return new AsyncDependency();
  }
}

@injectable()
class Dependency1 {
  constructor(
    @inject(AsyncDependency)
    public readonly asyncDependency: AsyncDependency,
  ) {}
}

@injectable()
class Dependency2 {
  constructor(
    @inject(AsyncDependency) public readonly asyncDependency: AsyncDependency,
  ) {}
}

@injectable()
class Application {
  constructor(
    @inject(Dependency1)
    public readonly dependency1: Dependency1,
    @inject(Dependency2)
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
