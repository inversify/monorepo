/* eslint-disable @typescript-eslint/typedef */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable jest/expect-expect */
import { beforeEach, describe, expect, it } from '@jest/globals';

import 'reflect-metadata';

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

  describe('Container', () => {
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
          // @ts-expect-error :: can't call get() to get Promise
          expect(() => container.get('asyncNumber')).toThrow(
            'it has asynchronous dependencies',
          );
          const n: Promise<number> = container.getAsync('asyncNumber');
          expect(await n).toBe(1);
        });

        it('enforces strict bindings', () => {
          foo = container.get('foo');
          // @ts-expect-error :: can't assign Bar to Foo
          foo = container.get('bar');
          // @ts-expect-error :: unknown service identifier
          expect(() => container.get('unknown') as unknown).toThrow(
            'No matching bindings',
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
          const child = container.createChild();
          child.bind('unknown').toConstantValue('unknown');
          expect(child.get('unknown')).toBe('unknown');
        });

        it('automatically extends parent types', () => {
          const child = container.createChild<{ childProp: string }>();
          child.bind('childProp').toConstantValue('child');
          // @ts-expect-error :: unknown key
          child.bind('unknown').toConstantValue('unknown');
          expect(child.get('childProp')).toBe('child');
          expect(child.get('foo')).toBeTruthy();
        });

        it('allows a child to rebind different types to its parent bindings', () => {
          type OverridingChildMap = Omit<BindingMap, 'foo'> & { foo: string };
          const child = container.createChild<OverridingChildMap>();
          child.bind('foo').toConstantValue('foo');
          expect(child.get('foo')).toBe('foo');
        });

        it('tracks the types of ancestors', () => {
          type ChildMap = BindingMap & { lorem: string };
          const child = container.createChild<ChildMap>();
          child.bind('lorem').toConstantValue('lorem');
          foo = child.parent!.get('foo');
          // @ts-expect-error :: can't assign Bar to Foo
          foo = child.parent!.get('bar');

          type GrandchildMap = ChildMap & { ipsum: string };
          const grandchild = child.createChild<GrandchildMap>();
          const lorem: string = grandchild.parent!.get('lorem');
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          lorem;

          foo = grandchild.parent!.parent!.get('foo');
          // @ts-expect-error :: can't assign Bar to Foo
          foo = grandchild.parent!.parent!.get('bar');
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
    });
  });
});