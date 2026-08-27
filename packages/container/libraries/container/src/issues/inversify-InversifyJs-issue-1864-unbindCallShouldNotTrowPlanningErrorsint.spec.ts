import 'reflect-metadata/lite';
import { describe, expect, it } from 'vitest';

import { type Inject, type Injectable, type InjectMulti } from '@inversifyjs/core';

import { Container } from '../container/services/Container.js';

describe('inversify/InversifyJS#1864', () => {
  it('Container unbindAsync request should not throw planning errors', () => {
    class Foo implements Injectable {
      constructor(_bar: Inject<string>) {}
    }

    const container: Container = new Container();
    container.bind(Foo).toSelf();
    container.bind('bar').toConstantValue('bar');

    container.get(Foo);

    expect(() => {
      container.unbind('bar');
      container.unbind(Foo);
      container.unbind(Foo);
    }).not.toThrow();
  });

  it('Container leaf bind request should not throw planning errors', () => {
    class Foo implements Injectable {
      constructor(_bar: InjectMulti<string>) {}
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
    class Foo implements Injectable {
      constructor(_bar: InjectMulti<unknown>) {}
    }

    class Bar implements Injectable {
      constructor(_baz: Inject<string>) {}
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
    class Foo implements Injectable {
      constructor(_bar: InjectMulti<unknown>) {}
    }

    class Circular implements Injectable {
      constructor(_circular: Inject<Circular>) {}
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
