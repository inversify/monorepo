/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable vitest/expect-expect */
import { beforeEach, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { Container, injectable } from 'inversify';

import { TypedContainer } from './index';

describe('interfaces', () => {
  @injectable()
  class Foo {
    public foo: string = '';
  }

  @injectable()
  class Bar {
    public bar: string = '';
  }

  describe(Container, () => {
    let foo: Foo;
    let foos: Foo[];

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      foo;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      foos;
    });

    describe('no binding map', () => {
      let container: TypedContainer;

      beforeEach(() => {
        container = new Container() as TypedContainer;
      });

      describe('bind()', () => {
        it('binds without a type argument', () => {
          container.bind('foo').to(Foo);
          container.bind(Foo).to(Foo);
        });

        it('checks bindings with an explicit type argument', () => {
          container.bind<Foo>('foo').to(Foo);
          // @ts-expect-error :: can't bind Bar to Foo
          container.bind<Foo>('foo').to(Bar);
        });

        it('binds a class as a service identifier', () => {
          container.bind(Foo).to(Foo);
          // @ts-expect-error :: can't bind Bar to Foo
          container.bind(Foo).to(Bar);
        });
      });

      describe('get()', () => {
        beforeEach(() => {
          container.bind('foo').to(Foo);
          container.bind('bar').to(Bar);
          container.bind(Foo).to(Foo);
          container.bind(Bar).to(Bar);
        });

        it('gets an anonymous binding', () => {
          foo = container.get('foo');
        });

        it('enforces type arguments', () => {
          foo = container.get<Foo>('foo');
          // @ts-expect-error :: can't assign Bar to Foo
          foo = container.get<Bar>('bar');
        });

        it('gets a class identifier', () => {
          foo = container.get(Foo);
          // @ts-expect-error :: can't assign Bar to Foo
          foo = container.get(Bar);
        });

        it('gets all', () => {
          foos = container.getAll<Foo>('foo');
          // @ts-expect-error :: can't assign Bar to Foo
          foos = container.getAll<Bar>('bar');
        });
      });

      describe('rebind()', () => {
        it('binds without a type argument', async () => {
          (await container.rebind('foo')).to(Foo);
          (await container.rebind(Foo)).to(Foo);
        });

        it('checks bindings with an explicit type argument', async () => {
          (await container.rebind<Foo>('foo')).to(Foo);
          // @ts-expect-error :: can't bind Bar to Foo
          (await container.rebind<Foo>('foo')).to(Bar);
        });

        it('binds a class as a service identifier', async () => {
          (await container.rebind(Foo)).to(Foo);
          // @ts-expect-error :: can't bind Bar to Foo
          (await container.rebind(Foo)).to(Bar);
        });
      });

      describe('rebindSync()', () => {
        it('binds without a type argument', () => {
          container.rebindSync('foo').to(Foo);
          container.rebindSync(Foo).to(Foo);
        });

        it('checks bindings with an explicit type argument', () => {
          container.rebindSync<Foo>('foo').to(Foo);
          // @ts-expect-error :: can't bind Bar to Foo
          container.rebindSync<Foo>('foo').to(Bar);
        });

        it('binds a class as a service identifier', () => {
          container.rebindSync(Foo).to(Foo);
          // @ts-expect-error :: can't bind Bar to Foo
          container.rebindSync(Foo).to(Bar);
        });
      });

      describe('unbind()', () => {
        it('binds without a type argument', async () => {
          await container.unbind('foo');
          await container.unbind(Foo);
        });
      });

      describe('unbindSync()', () => {
        it('binds without a type argument', () => {
          container.unbindSync('foo');
          container.unbindSync(Foo);
        });
      });
    });

    describe('binding map', () => {
      interface BindingMap {
        foo: Foo;
        bar: Bar;
        asyncNumber: Promise<number>;
      }

      let container: TypedContainer<BindingMap>;

      beforeEach(() => {
        container = new Container() as TypedContainer<BindingMap>;
      });

      describe('bind()', () => {
        it('enforces strict bindings', () => {
          container.bind('foo').to(Foo);
          // @ts-expect-error :: can't bind Bar to Foo
          container.bind('foo').to(Bar);
          // @ts-expect-error :: unknown service identifier
          container.bind('unknown').to(Foo);
        });
      });

      describe('get()', () => {
        beforeEach(() => {
          container.bind('foo').to(Foo);
          container.bind('bar').to(Bar);
          container.bind('asyncNumber').toConstantValue(Promise.resolve(1));
        });

        it('gets a promise', async () => {
          expect(() => {
            const num = container.get('asyncNumber');
            /* eslint-disable @typescript-eslint/no-unused-expressions */
            // @ts-expect-error :: num is never
            num.then;
            /* eslint-enable @typescript-eslint/no-unused-expressions */
          }).toThrow('Unexpected asynchronous service');

          const n: Promise<number> = container.getAsync('asyncNumber');

          await expect(n).resolves.toBe(1);
        });

        it('enforces strict bindings', () => {
          foo = container.get('foo');
          // @ts-expect-error :: can't assign Bar to Foo
          foo = container.get('bar');

          // @ts-expect-error :: unknown service identifier
          expect(() => container.get('unknown') as unknown).toThrow(
            'No bindings found',
          );
        });

        it('gets all', () => {
          foos = container.getAll('foo');
          // @ts-expect-error :: can't assign Bar to Foo
          foos = container.getAll('bar');
        });
      });

      describe('ancestry', () => {
        beforeEach(() => {
          container.bind('foo').to(Foo);
          container.bind('bar').to(Bar);
        });

        it('defaults a child to have an `any` map', () => {
          const child = new TypedContainer({ parent: container });
          child.bind('unknown').toConstantValue('unknown');

          expect(child.get('unknown')).toBe('unknown');
        });

        it('allows a TypedContainer parent', () => {
          const child = new TypedContainer<{ childProp: string } & BindingMap>({
            parent: container,
          });
          child.bind('childProp').toConstantValue('child');
          // @ts-expect-error :: unknown key
          child.bind('unknown').toConstantValue('unknown');

          expect(child.get('childProp')).toBe('child');
          expect(child.get('foo')).toStrictEqual(new Foo());
        });
      });

      describe('instantiation', () => {
        it('constructs', () => {
          container = new TypedContainer<BindingMap>();
          container.bind('foo').to(Foo);
          // @ts-expect-error :: can't bind Bar to Foo
          container.bind('foo').to(Bar);
        });
      });

      describe('generics', () => {
        beforeEach(() => {
          container.bind('foo').to(Foo);
        });

        it('can be used in a generic function', () => {
          function test<T extends BindingMap>(
            container: TypedContainer<T>,
          ): void {
            const foo: Foo = container.get('foo');
            // @ts-expect-error :: can't assign Foo to Bar
            const bar: Bar = container.get('foo');

            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            foo;
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            bar;
          }

          test(container);
        });
      });

      describe('rebind()', () => {
        it('enforces strict bindings', async () => {
          (await container.rebind('foo')).to(Foo);
          // @ts-expect-error :: can't bind Bar to Foo
          (await container.rebind('foo')).to(Bar);
          // @ts-expect-error :: unknown service identifier
          (await container.rebind('unknown')).to(Foo);
        });
      });

      describe('rebindSync()', () => {
        it('enforces strict bindings', () => {
          container.rebindSync('foo').to(Foo);
          // @ts-expect-error :: can't bind Bar to Foo
          container.rebindSync('foo').to(Bar);
          // @ts-expect-error :: unknown service identifier
          container.rebindSync('unknown').to(Foo);
        });
      });

      describe('unbind()', () => {
        it('enforces strict bindings', async () => {
          await container.unbind('foo');
          // @ts-expect-error :: unknown service identifier
          await container.unbind('unknown');
        });
      });

      describe('unbindSync()', () => {
        it('enforces strict bindings', () => {
          container.unbindSync('foo');
          // @ts-expect-error :: unknown service identifier
          container.unbindSync('unknown');
        });
      });
    });
  });
});
