import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { injectable, multiInject } from '@inversifyjs/core';

import {
  ContainerModule,
  ContainerModuleLoadOptions,
} from '../models/ContainerModule';
import { Container } from './Container';

@injectable()
class Gun {}

@injectable()
class Arsenal {
  constructor(@multiInject(Gun) public guns: Gun[]) {}
}

describe(Container, () => {
  describe('.get', () => {
    describe('when container has one gun binding and one arsenal binding', () => {
      describe('when container.get is called for Arsenal', () => {
        let container: Container;

        let arsenal: Arsenal;

        beforeAll(() => {
          container = new Container();

          container.bind(Gun).to(Gun);
          container.bind(Arsenal).to(Arsenal);

          arsenal = container.get(Arsenal);
        });

        it('should provide an arsenal with two guns', () => {
          expect(arsenal).toBeInstanceOf(Arsenal);
          expect(arsenal.guns).toHaveLength(1);

          arsenal.guns.forEach((gun: Gun) => expect(gun).toBeInstanceOf(Gun));
        });
      });

      describe('when container.get is called twice and gun binding is unbound in the middle', () => {
        let container: Container;
        let arsenal: Arsenal;

        beforeAll(async () => {
          container = new Container();

          container.bind(Gun).to(Gun);
          container.bind(Arsenal).to(Arsenal);

          // First call to get Arsenal
          container.get(Arsenal);

          // Unbind Gun
          await container.unbind(Gun);

          // Second call to get Arsenal
          arsenal = container.get(Arsenal);
        });

        it('should provide an arsenal with no guns', () => {
          expect(arsenal).toBeInstanceOf(Arsenal);
          expect(arsenal.guns).toHaveLength(0);
        });
      });

      describe('when container.get is called twice and all bindings are unbound in the middle', () => {
        let container: Container;
        let result: unknown;

        beforeAll(async () => {
          container = new Container();

          container.bind(Gun).to(Gun);
          container.bind(Arsenal).to(Arsenal);

          // First call to get Arsenal
          container.get(Arsenal);

          // Unbind all bindings
          await container.unbindAll();

          // Second call to get Arsenal
          try {
            container.get(Arsenal);
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should throw an Error', () => {
          const expectedErrorProperties: Partial<Error> = {
            message: `No bindings found for service: "Arsenal".

Trying to resolve bindings for "Arsenal (Root service)".

Binding constraints:
- service identifier: Arsenal
- name: -`,
          };

          expect(result).toBeInstanceOf(Error);
          expect(result).toMatchObject(expectedErrorProperties);
        });
      });

      describe('when container.get is called twice and gun binding is added in the middle', () => {
        let container: Container;
        let arsenal: Arsenal;

        beforeAll(() => {
          container = new Container();

          container.bind(Gun).to(Gun);
          container.bind(Arsenal).to(Arsenal);

          // First call to get Arsenal
          container.get(Arsenal);

          // Add Gun binding
          container.bind(Gun).to(Gun);

          // Second call to get Arsenal
          arsenal = container.get(Arsenal);
        });

        it('should provide an arsenal with one gun', () => {
          expect(arsenal).toBeInstanceOf(Arsenal);
          expect(arsenal.guns).toHaveLength(2);

          arsenal.guns.forEach((gun: Gun) => expect(gun).toBeInstanceOf(Gun));
        });
      });

      describe('when container.get is called twice and gun binding is unbound using a ContainerModule in the middle', () => {
        let container: Container;
        let arsenal: Arsenal;

        beforeAll(async () => {
          container = new Container();

          container.bind(Gun).to(Gun);
          container.bind(Arsenal).to(Arsenal);

          // First call to get Arsenal
          container.get(Arsenal);

          // Create and load a ContainerModule to unbind Gun
          const module: ContainerModule = new ContainerModule(
            async ({ unbind }: ContainerModuleLoadOptions) => {
              await unbind(Gun);
            },
          );

          await container.load(module);

          // Second call to get Arsenal
          arsenal = container.get(Arsenal);
        });

        it('should provide an arsenal with no guns', () => {
          expect(arsenal).toBeInstanceOf(Arsenal);
          expect(arsenal.guns).toHaveLength(0);
        });
      });

      describe('when container.get is called twice and gun binding is added using a ContainerModule in the middle', () => {
        let container: Container;
        let arsenal: Arsenal;

        beforeAll(async () => {
          container = new Container();

          container.bind(Arsenal).to(Arsenal);

          // First call to get Arsenal
          container.get(Arsenal);

          // Create and load a ContainerModule to bind Gun
          const module: ContainerModule = new ContainerModule(
            ({ bind }: ContainerModuleLoadOptions) => {
              bind(Gun).to(Gun);
            },
          );

          await container.load(module);

          // Second call to get Arsenal
          arsenal = container.get(Arsenal);
        });

        it('should provide an arsenal with one gun', () => {
          expect(arsenal).toBeInstanceOf(Arsenal);
          expect(arsenal.guns).toHaveLength(1);

          arsenal.guns.forEach((gun: Gun) => expect(gun).toBeInstanceOf(Gun));
        });
      });

      describe('when container.get is called twice and gun binding is added using a ContainerModule with loadSync in the middle', () => {
        let container: Container;
        let arsenal: Arsenal;

        beforeAll(() => {
          container = new Container();

          container.bind(Arsenal).to(Arsenal);

          // First call to get Arsenal
          container.get(Arsenal);

          // Create and load a ContainerModule to bind Gun
          const module: ContainerModule = new ContainerModule(
            ({ bind }: ContainerModuleLoadOptions) => {
              bind(Gun).to(Gun);
            },
          );

          container.loadSync(module);

          // Second call to get Arsenal
          arsenal = container.get(Arsenal);
        });

        it('should provide an arsenal with one gun', () => {
          expect(arsenal).toBeInstanceOf(Arsenal);
          expect(arsenal.guns).toHaveLength(1);

          arsenal.guns.forEach((gun: Gun) => expect(gun).toBeInstanceOf(Gun));
        });
      });

      describe('when Container.loadSync() is called and Container.unloadSync() is called to remove a module', () => {
        let container: Container;
        let arsenal: Arsenal;
        let module: ContainerModule;
        let arsenalGunsBeforeUnload: Gun[];

        beforeAll(() => {
          container = new Container();
          container.bind(Arsenal).to(Arsenal);

          // Create and load a ContainerModule to bind Gun
          module = new ContainerModule(
            ({ bind }: ContainerModuleLoadOptions) => {
              bind(Gun).to(Gun);
            },
          );

          container.loadSync(module);

          // First call to get Arsenal
          arsenal = container.get(Arsenal);
          arsenalGunsBeforeUnload = arsenal.guns;

          // Unload the module
          container.unloadSync(module);

          // Second call to get Arsenal
          arsenal = container.get(Arsenal);
        });

        it('should provide an arsenal with a guns before unloading the module', () => {
          expect(arsenal).toBeInstanceOf(Arsenal);
          expect(arsenalGunsBeforeUnload).toStrictEqual([new Gun()]);
        });

        it('should provide an arsenal with no guns after unloading the module', () => {
          expect(arsenal).toBeInstanceOf(Arsenal);
          expect(arsenal.guns).toStrictEqual([]);
        });
      });
    });
  });

  describe('.snapshot', () => {
    describe('having some classes to be bound', () => {
      let container: Container;

      @injectable()
      class Ninja {}

      @injectable()
      class Samurai {}

      beforeAll(() => {
        container = new Container();
      });

      describe('when classes are bound', () => {
        beforeAll(() => {
          container.bind(Ninja).to(Ninja);
          container.bind(Samurai).to(Samurai);
        });

        it('should be able to resolve the classes', () => {
          expect(container.get(Ninja)).toBeInstanceOf(Ninja);
          expect(container.get(Samurai)).toBeInstanceOf(Samurai);
        });

        describe('when called container.snapshot() and Ninja is unbound', () => {
          beforeAll(async () => {
            container.snapshot();
            await container.unbind(Ninja);
          });

          it('should not be able to resolve Ninja', () => {
            expect(() => container.get(Ninja)).toThrow(
              'No bindings found for service: "Ninja"',
            );
          });

          it('should be able to resolve Samurai', () => {
            expect(container.get(Samurai)).toBeInstanceOf(Samurai);
          });

          describe('when called container.snapshot()', () => {
            beforeAll(async () => {
              container.snapshot();
            });

            it('should not be able to resolve Ninja', () => {
              expect(() => container.get(Ninja)).toThrow(
                'No bindings found for service: "Ninja"',
              );
            });

            it('should be able to resolve Samurai', () => {
              expect(container.get(Samurai)).toBeInstanceOf(Samurai);
            });

            describe('when Ninja is bound again', () => {
              beforeAll(() => {
                container.bind(Ninja).to(Ninja);
              });

              it('should be able to resolve the classes', () => {
                expect(container.get(Ninja)).toBeInstanceOf(Ninja);
                expect(container.get(Samurai)).toBeInstanceOf(Samurai);
              });

              describe('when called container.restore()', () => {
                beforeAll(() => {
                  container.restore();
                });

                it('should not be able to resolve Ninja', () => {
                  expect(() => container.get(Ninja)).toThrow(
                    'No bindings found for service: "Ninja"',
                  );
                });

                it('should be able to resolve Samurai', () => {
                  expect(container.get(Samurai)).toBeInstanceOf(Samurai);
                });

                describe('when called container.restore()', () => {
                  beforeAll(() => {
                    container.restore();
                  });

                  it('should be able to resolve the classes', () => {
                    expect(container.get(Ninja)).toBeInstanceOf(Ninja);
                    expect(container.get(Samurai)).toBeInstanceOf(Samurai);
                  });

                  describe('when called container.restore()', () => {
                    let result: unknown;

                    beforeAll(() => {
                      try {
                        container.restore();
                      } catch (error: unknown) {
                        result = error;
                      }
                    });

                    it('should throw an Error', () => {
                      expect(result).toBeInstanceOf(Error);
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
