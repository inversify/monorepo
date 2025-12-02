import { describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { inject, multiInject } from '@inversifyjs/core';

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

  it('Container leaf bind request should not throw planning errors', () => {
    class Foo {
      constructor(@multiInject('bar') _bar: string[]) {}
    }

    const container: Container = new Container();
    container.bind(Foo).toSelf();
    container.bind('bar').toConstantValue('bar');

    container.get(Foo);

    expect(() => {
      container.bind('bar').toConstantValue('bar');
    }).not.toThrow();
  });

  it('Container non leaf bind request should not throw planning errors', () => {
    class Foo {
      constructor(@multiInject('bar') _bar: unknown[]) {}
    }

    class Bar {
      constructor(@inject('baz') _baz: string) {}
    }

    const container: Container = new Container();
    container.bind(Foo).toSelf();
    container.bind('bar').toConstantValue('bar');

    container.get(Foo);

    expect(() => {
      container.bind('bar').to(Bar);
    }).not.toThrow();

    container.bind('baz').toConstantValue('baz');

    const foo: Foo = container.get(Foo);

    expect(foo).toStrictEqual(new Foo(['bar', new Bar('baz')]));
  });

  it('Container non leaf circular bind request should not throw planning errors', () => {
    class Foo {
      constructor(@multiInject('bar') _bar: unknown[]) {}
    }

    class Circular {
      constructor(@inject(Circular) _circular: Circular) {}
    }

    const container: Container = new Container();
    container.bind(Foo).toSelf();
    container.bind('bar').toConstantValue('bar');
    container.bind(Circular).toSelf();

    container.get(Foo);

    expect(() => {
      container.bind('bar').to(Circular);
    }).not.toThrow();
  });
});
