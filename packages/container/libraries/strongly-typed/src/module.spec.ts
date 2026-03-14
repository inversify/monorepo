/* eslint-disable @typescript-eslint/typedef */
import { beforeEach, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { injectable } from 'inversify';

import { TypedContainer } from './container.js';
import { TypedContainerModule } from './module.js';

describe('interfaces', () => {
  @injectable()
  class Foo {
    public foo: string = '';
  }

  @injectable()
  class Bar {
    public bar: string = '';
  }

  // eslint-disable-next-line vitest/prefer-describe-function-title
  describe('TypedContainerModule', () => {
    describe('no binding map', () => {
      let module: TypedContainerModule;

      beforeEach(() => {
        module = new TypedContainerModule(({ bind }) => {
          bind('foo').to(Foo);
        });
      });

      it('has an id', () => {
        expect(module.id).toBeDefined();
      });

      describe('.load()', () => {
        it('can load a module', () => {
          const container = new TypedContainer();
          container.load(module);

          expect(container.isBound('foo')).toBe(true);
        });
      });
    });

    describe('binding map', () => {
      interface BindingMap {
        foo: Foo;
        bar: Bar;
      }

      describe('instantiation', () => {
        it('constructs with synchronous load', () => {
          const module = new TypedContainerModule<BindingMap>(({ bind }) => {
            bind('foo').to(Foo);
            // @ts-expect-error :: can't bind Bar to Foo
            bind('foo').to(Bar);
            // @ts-expect-error :: unknown service identifier
            bind('unknown').to(Foo);
          });

          expect(module).toBeDefined();
        });

        it('constructs with asynchronous load', () => {
          const module = new TypedContainerModule<BindingMap>(
            async (options) => {
              options.bind('foo').to(Foo);
              // @ts-expect-error :: can't bind Bar to Foo
              options.bind('foo').to(Bar);
              // @ts-expect-error :: unknown service identifier
              options.bind('unknown').to(Foo);
            },
          );

          expect(module).toBeDefined();
        });
      });

      describe('with container', () => {
        let container: TypedContainer<BindingMap>;

        beforeEach(() => {
          container = new TypedContainer<BindingMap>();
        });

        it('loads module into container', () => {
          const module = new TypedContainerModule<BindingMap>((options) => {
            options.bind('foo').to(Foo);
          });

          container.load(module);

          expect(container.isBound('foo')).toBe(true);
          expect(container.get('foo')).toBeInstanceOf(Foo);
        });

        it('supports onActivation', () => {
          const module = new TypedContainerModule<BindingMap>((options) => {
            options.bind('foo').to(Foo);
            options.onActivation('foo', (_context, instance) => {
              instance.foo = 'activated';
              return instance;
            });
          });

          container.load(module);

          const instance = container.get('foo');

          expect(instance.foo).toBe('activated');
        });

        it('supports onDeactivation', () => {
          const module = new TypedContainerModule<BindingMap>((options) => {
            options.bind('foo').to(Foo);
            options.onDeactivation('foo', () => {
              // no-op
            });
          });

          container.load(module);

          expect(container.isBound('foo')).toBe(true);
        });

        it('supports rebindAsync using async load', async () => {
          // First bind foo to Foo
          container.bind('foo').to(Foo);

          // Then use module to rebind it to Bar
          const module = new TypedContainerModule<BindingMap>(
            async (options) => {
              if (options.isBound('foo')) {
                const rebindResult = await options.rebindAsync('foo');
                // @ts-expect-error :: Expect error when setting wrong type
                rebindResult.to(Bar);
              }
            },
          );

          await container.loadAsync(module);

          expect(() => {
            // @ts-expect-error :: Expect error when getting wrong type
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const incorrectResult: Foo = container.get('bar');
          }).toThrow('No bindings found for service: "bar".');

          const result = container.get('foo');

          expect(result).toBeInstanceOf(Bar);
        });

        it('supports rebind', () => {
          // First bind bar to Bar
          container.bind('bar').to(Bar);

          // Then use module to rebind it synchronously
          const module = new TypedContainerModule<BindingMap>((options) => {
            if (options.isBound('bar')) {
              const barInstance = new Bar();
              barInstance.bar = 'reboundSync';
              options.rebind('bar').toConstantValue(barInstance);
            }
            // @ts-expect-error :: unknown service identifier
            options.rebind('unknown');
          });

          container.load(module);

          const result = container.get('bar');

          expect(result).toBeInstanceOf(Bar);
          expect(result.bar).toBe('reboundSync');
        });

        it('supports unbindAsync using async load', async () => {
          // First bind foo to Foo
          container.bind('foo').to(Foo);

          // Then use module to unbind it and bind to Bar
          const module = new TypedContainerModule<BindingMap>(
            async (options) => {
              if (options.isBound('foo')) {
                await options.unbindAsync('foo');
              }
              // @ts-expect-error :: unknown service identifier
              await options.unbindAsync('unknown');

              // @ts-expect-error :: incorrect type of target
              options.bind('foo').to(Bar);
            },
          );

          await container.loadAsync(module);

          expect(container.get('foo')).toBeInstanceOf(Bar);
        });

        it('supports unbind', () => {
          // First bind foo to Foo
          container.bind('foo').to(Foo);

          // Then use module to unbind it synchronously and bind to Bar
          const module = new TypedContainerModule<BindingMap>((options) => {
            if (options.isBound('foo')) {
              options.unbind('foo');
            }
            // @ts-expect-error :: unknown service identifier
            options.unbind('unknown');

            // @ts-expect-error :: incorrect type of target
            options.bind('foo').to(Bar);
          });

          container.load(module);

          expect(container.get('foo')).toBeInstanceOf(Bar);
        });
      });

      describe('generics', () => {
        it('can be used in a generic function', () => {
          function test<T extends BindingMap>(
            module: TypedContainerModule<T>,
          ): void {
            expect(module).toBeDefined();
          }

          const module = new TypedContainerModule<BindingMap>((options) => {
            options.bind('foo').to(Foo);
            // @ts-expect-error :: can't bind Bar to Foo
            options.bind('foo').to(Bar);
          });

          test(module);
        });
      });
    });
  });
});
