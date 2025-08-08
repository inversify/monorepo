import { describe, expect, it } from 'vitest';

import 'reflect-metadata';

import { inject } from '@inversifyjs/core';

import { Container } from '../container/services/Container';

describe('inversify/InversifyJS#1864', () => {
  it('Container unbind request should not throw planning errors', () => {
    class Foo {
      constructor(@inject('bar') _bar: string) {}
    }

    const container: Container = new Container();
    container.bind(Foo).toSelf();
    container.bind('bar').toConstantValue('bar');

    container.get(Foo);

    expect(() => {
      container.unbindSync('bar');
      container.unbindSync(Foo);
      container.unbindSync(Foo);
    }).not.toThrow();
  });
});
