import { describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { Container } from '../container/services/Container';

describe('inversify/InversifyJS#1806', () => {
  it('container.get() should not update snapshot bindings', () => {
    class Foo {}

    const container: Container = new Container();

    container.bind(Foo).toSelf().inSingletonScope();

    container.snapshot();

    const resolvedService: Foo = container.get(Foo);

    container.restore();

    const resolvedServiceAfterRestore: Foo = container.get(Foo);

    expect(resolvedService).not.toBe(resolvedServiceAfterRestore);
  });
});
