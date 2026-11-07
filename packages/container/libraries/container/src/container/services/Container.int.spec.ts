import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

import 'reflect-metadata/lite';

import { type ServiceIdentifier } from '@inversifyjs/common';
import {
  type BindingConstraints,
  bindingScopeValues,
  bindingTypeValues,
  type Factory,
  type GetPlanOptions,
  inject,
  injectable,
  type InstanceBindingInspection,
  InversifyCoreError,
  multiInject,
  named,
  optional,
  type PlanBindingInspection,
  type PlanInspection,
  type PlanServiceInspection,
  type ResolutionContext,
  type SingleBindingPlanServiceInspection,
  tagged,
  unmanaged,
} from '@inversifyjs/core';
import { Plugin, type PluginApi } from '@inversifyjs/plugin';

import { type BindingIdentifier } from '../../binding/models/BindingIdentifier.js';
import {
  ContainerModule,
  type ContainerModuleLoadOptions,
} from '../models/ContainerModule.js';
import { Container } from './Container.js';

const bladeServiceId: ServiceIdentifier = Symbol.for('Blade');
const materialServiceId: ServiceIdentifier = Symbol.for('Material');
const shieldServiceId: ServiceIdentifier = Symbol.for('Shield');
const throwableWeaponServiceId: ServiceIdentifier =
  Symbol.for('ThrowableWeapon');
const warriorServiceId: ServiceIdentifier = Symbol.for('Warrior');
const weaponServiceId: ServiceIdentifier = Symbol.for('Weapon');

function captureError(fn: () => unknown): unknown {
  try {
    fn();
  } catch (error: unknown) {
    return error;
  }

  throw new Error('Expected an error to be thrown');
}

function getBindingInspection(
  serviceInspection: PlanServiceInspection | undefined,
): PlanBindingInspection | undefined {
  return (serviceInspection as SingleBindingPlanServiceInspection | undefined)
    ?.binding;
}

function getInstanceBindingInspection(
  serviceInspection: PlanServiceInspection | undefined,
): InstanceBindingInspection {
  return getBindingInspection(serviceInspection) as InstanceBindingInspection;
}

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
          await container.unbindAsync(Gun);

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
          await container.unbindAllAsync();

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

          // Create and load a ContainerModule to unbindAsync Gun
          const module: ContainerModule = new ContainerModule(
            async ({ unbindAsync }: ContainerModuleLoadOptions) => {
              await unbindAsync(Gun);
            },
          );

          await container.loadAsync(module);

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

          await container.loadAsync(module);

          // Second call to get Arsenal
          arsenal = container.get(Arsenal);
        });

        it('should provide an arsenal with one gun', () => {
          expect(arsenal).toBeInstanceOf(Arsenal);
          expect(arsenal.guns).toHaveLength(1);

          arsenal.guns.forEach((gun: Gun) => expect(gun).toBeInstanceOf(Gun));
        });
      });

      describe('when container.get is called twice and gun binding is added using a ContainerModule with load in the middle', () => {
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

          container.load(module);

          // Second call to get Arsenal
          arsenal = container.get(Arsenal);
        });

        it('should provide an arsenal with one gun', () => {
          expect(arsenal).toBeInstanceOf(Arsenal);
          expect(arsenal.guns).toHaveLength(1);

          arsenal.guns.forEach((gun: Gun) => expect(gun).toBeInstanceOf(Gun));
        });
      });

      describe('when Container.load() is called and Container.unload() is called to remove a module', () => {
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

          container.load(module);

          // First call to get Arsenal
          arsenal = container.get(Arsenal);
          arsenalGunsBeforeUnload = arsenal.guns;

          // Unload the module
          container.unload(module);

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

  describe('.getAll', () => {
    describe('when container has only named bindings for the same identifier', () => {
      let container: Container;

      beforeAll(() => {
        container = new Container();

        container
          .bind('foo')
          .toConstantValue('bar')
          .when(
            (metadata: BindingConstraints): boolean =>
              metadata.name === undefined,
          );

        container
          .bind('Intl')
          .toConstantValue({ hello: 'bonjour' })
          .whenNamed('fr');
        container
          .bind('Intl')
          .toConstantValue({ goodbye: 'au revoir' })
          .whenNamed('fr');
        container
          .bind('Intl')
          .toConstantValue({ hello: 'hola' })
          .whenNamed('es');
        container
          .bind('Intl')
          .toConstantValue({ goodbye: 'adios' })
          .whenNamed('es');
      });

      describe('when called with no name option', () => {
        let result: unknown;

        beforeAll(() => {
          result = container.getAll('Intl');
        });

        it('should return no bindings', () => {
          expect(result).toStrictEqual([]);
        });
      });

      describe('when called with name "fr"', () => {
        let result: unknown;

        beforeAll(() => {
          result = container.getAll('Intl', { name: 'fr' });
        });

        it('should return only bindings named "fr"', () => {
          expect(result).toStrictEqual([
            { hello: 'bonjour' },
            { goodbye: 'au revoir' },
          ]);
        });
      });

      describe('when called with name "es"', () => {
        let result: unknown;

        beforeAll(() => {
          result = container.getAll('Intl', { name: 'es' });
        });

        it('should return only bindings named "es"', () => {
          expect(result).toStrictEqual([
            { hello: 'hola' },
            { goodbye: 'adios' },
          ]);
        });
      });
    });

    describe('when container has an unconstrained binding and named bindings for the same identifier', () => {
      let container: Container;

      beforeAll(() => {
        container = new Container();

        container.bind('Intl').toConstantValue({ hello: 'hello' });
        container
          .bind('Intl')
          .toConstantValue({ hello: 'bonjour' })
          .whenNamed('fr');
        container
          .bind('Intl')
          .toConstantValue({ hello: 'hola' })
          .whenNamed('es');
      });

      describe('when called with no name option', () => {
        let result: unknown;

        beforeAll(() => {
          result = container.getAll('Intl');
        });

        it('should return only the unconstrained binding', () => {
          expect(result).toStrictEqual([{ hello: 'hello' }]);
        });
      });

      describe('when called with name "es"', () => {
        let result: unknown;

        beforeAll(() => {
          result = container.getAll('Intl', { name: 'es' });
        });

        it('should return the unconstrained binding and the bindings named "es"', () => {
          expect(result).toStrictEqual([{ hello: 'hello' }, { hello: 'hola' }]);
        });
      });
    });
  });

  describe('.inspectCurrentPlan', () => {
    describe('having a service bound to a class in singleton scope with an activation', () => {
      let katanaConstructorMock: Mock<() => void>;
      let activationMock: Mock<
        (context: ResolutionContext, value: unknown) => unknown
      >;

      let container: Container;
      let bindingIdentifier: BindingIdentifier;

      beforeAll(() => {
        katanaConstructorMock = vitest.fn();
        activationMock = vitest.fn(
          (_context: ResolutionContext, value: unknown): unknown => value,
        );

        @injectable()
        class Katana {
          constructor() {
            katanaConstructorMock();
          }
        }

        container = new Container();

        bindingIdentifier = container
          .bind(weaponServiceId)
          .to(Katana)
          .inSingletonScope()
          .onActivation(activationMock)
          .getIdentifier();
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = container.inspectCurrentPlan(weaponServiceId);
        });

        it('should return a PlanInspection', () => {
          const expected: PlanInspection = {
            root: {
              binding: {
                constructorArguments: [],
                id: bindingIdentifier.id,
                implementationType: expect.any(Function),
                moduleId: undefined,
                properties: new Map(),
                scope: bindingScopeValues.Singleton,
                serviceIdentifier: weaponServiceId,
                type: bindingTypeValues.Instance,
              },
              isMultiple: false,
              name: undefined,
              optional: false,
              serviceIdentifier: weaponServiceId,
              tags: new Map(),
            },
          };

          expect(result).toStrictEqual(expected);
        });

        it('should not construct the service', () => {
          expect(katanaConstructorMock).not.toHaveBeenCalled();
        });

        it('should not call the activation', () => {
          expect(activationMock).not.toHaveBeenCalled();
        });
      });

      describe('when called, and container.get() is called', () => {
        beforeAll(() => {
          container.inspectCurrentPlan(weaponServiceId);
          container.get(weaponServiceId);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should construct the service once', () => {
          expect(katanaConstructorMock).toHaveBeenCalledTimes(1);
        });

        it('should call the activation once', () => {
          expect(activationMock).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('having a service bound to two classes', () => {
      @injectable()
      class Katana {}

      @injectable()
      class Shuriken {}

      let container: Container;

      beforeAll(() => {
        container = new Container();

        container.bind(weaponServiceId).to(Katana);
        container.bind(weaponServiceId).to(Shuriken);
      });

      describe('when called, with isMultiple true', () => {
        let result: PlanInspection;

        beforeAll(() => {
          result = container.inspectCurrentPlan(weaponServiceId, {
            isMultiple: true,
          });
        });

        it('should return a multiple service inspection with both bindings in order', () => {
          expect(result.root).toStrictEqual(
            expect.objectContaining({
              bindings: [
                expect.objectContaining({ implementationType: Katana }),
                expect.objectContaining({ implementationType: Shuriken }),
              ],
              chained: false,
              isMultiple: true,
            }),
          );
        });
      });

      describe('when called, with no options', () => {
        let result: unknown;
        let getError: unknown;

        beforeAll(() => {
          result = captureError(() =>
            container.inspectCurrentPlan(weaponServiceId),
          );
          getError = captureError(() => container.get(weaponServiceId));
        });

        it('should throw the error container.get() throws', () => {
          expect(result).toBeInstanceOf(InversifyCoreError);
          expect(result).toStrictEqual(getError);
        });
      });
    });

    describe('having a service bound with constraints satisfied by any request', () => {
      @injectable()
      class Katana {}

      let container: Container;

      beforeAll(() => {
        container = new Container();

        container
          .bind(weaponServiceId)
          .to(Katana)
          .when(() => true);
      });

      describe('when called, with every multiple request option', () => {
        let result: PlanInspection;

        beforeAll(() => {
          result = container.inspectCurrentPlan(weaponServiceId, {
            chained: true,
            isMultiple: true,
            name: 'melee',
            optional: true,
            tag: { key: 'kind', value: 'sharp' },
          });
        });

        it('should reflect the request constraints', () => {
          expect(result.root).toStrictEqual(
            expect.objectContaining({
              chained: true,
              isMultiple: true,
              name: 'melee',
              optional: true,
              serviceIdentifier: weaponServiceId,
              tags: new Map([['kind', 'sharp']]),
            }),
          );
        });
      });
    });

    describe('having a class with constrained dependencies', () => {
      @injectable()
      class Katana {}

      @injectable()
      class Ninja {
        @multiInject(weaponServiceId, { chained: true })
        public readonly weapons!: unknown[];

        constructor(
          @inject(weaponServiceId)
          @named('melee')
          @tagged('kind', 'sharp')
          @tagged('size', 'small')
          @optional()
          public readonly weapon: unknown,
        ) {}
      }

      let container: Container;

      beforeAll(() => {
        container = new Container();

        container
          .bind(weaponServiceId)
          .to(Katana)
          .when(() => true);
        container.bind(Ninja).toSelf();
      });

      describe('when called', () => {
        let result: PlanInspection;

        beforeAll(() => {
          result = container.inspectCurrentPlan(Ninja);
        });

        it('should reflect the constructor argument constraints', () => {
          expect(
            getInstanceBindingInspection(result.root).constructorArguments[0],
          ).toStrictEqual(
            expect.objectContaining({
              isMultiple: false,
              name: 'melee',
              optional: true,
              serviceIdentifier: weaponServiceId,
              tags: new Map([
                ['kind', 'sharp'],
                ['size', 'small'],
              ]),
            }),
          );
        });

        it('should reflect the property constraints', () => {
          expect(
            getInstanceBindingInspection(result.root).properties.get('weapons'),
          ).toStrictEqual(
            expect.objectContaining({
              chained: true,
              isMultiple: true,
            }),
          );
        });
      });
    });

    describe('having no bindings', () => {
      let container: Container;

      beforeAll(() => {
        container = new Container();
      });

      describe('when called, with optional true', () => {
        let result: PlanInspection;

        beforeAll(() => {
          result = container.inspectCurrentPlan(weaponServiceId, {
            optional: true,
          });
        });

        it('should return a service inspection with no binding', () => {
          expect(result.root).toStrictEqual(
            expect.objectContaining({
              binding: undefined,
              isMultiple: false,
            }),
          );
        });
      });

      describe('when called, with isMultiple true and optional true', () => {
        let result: PlanInspection;

        beforeAll(() => {
          result = container.inspectCurrentPlan(weaponServiceId, {
            isMultiple: true,
            optional: true,
          });
        });

        it('should return a service inspection with no bindings', () => {
          expect(result.root).toStrictEqual(
            expect.objectContaining({
              bindings: [],
              isMultiple: true,
            }),
          );
        });
      });

      describe('when called, with no options', () => {
        let result: unknown;
        let getError: unknown;

        beforeAll(() => {
          result = captureError(() =>
            container.inspectCurrentPlan(weaponServiceId),
          );
          getError = captureError(() => container.get(weaponServiceId));
        });

        it('should throw the error container.get() throws', () => {
          expect(result).toBeInstanceOf(InversifyCoreError);
          expect(result).toStrictEqual(getError);
        });
      });

      describe('when called, with isMultiple true', () => {
        let result: PlanInspection;

        beforeAll(() => {
          result = container.inspectCurrentPlan(weaponServiceId, {
            isMultiple: true,
          });
        });

        it('should return a service inspection with no bindings, as container.getAll() resolves none', () => {
          expect(result.root).toStrictEqual(
            expect.objectContaining({
              bindings: [],
              isMultiple: true,
            }),
          );
          expect(container.getAll(weaponServiceId)).toStrictEqual([]);
        });
      });
    });

    describe('having a service bound to named classes', () => {
      @injectable()
      class Katana {}

      @injectable()
      class Bow {}

      let container: Container;

      beforeAll(() => {
        container = new Container();

        container.bind(weaponServiceId).to(Katana).whenNamed('melee');
        container.bind(weaponServiceId).to(Bow).whenNamed('ranged');
      });

      describe('when called, with a name', () => {
        let result: PlanInspection;

        beforeAll(() => {
          result = container.inspectCurrentPlan(weaponServiceId, {
            name: 'ranged',
          });
        });

        it('should select the binding satisfying the name', () => {
          expect(getInstanceBindingInspection(result.root)).toStrictEqual(
            expect.objectContaining({ implementationType: Bow }),
          );
        });
      });
    });

    describe('having a service bound in a container module', () => {
      @injectable()
      class Katana {}

      let container: Container;
      let containerModule: ContainerModule;

      beforeAll(() => {
        container = new Container();
        containerModule = new ContainerModule(
          ({ bind }: ContainerModuleLoadOptions): void => {
            bind(weaponServiceId).to(Katana);
          },
        );

        container.load(containerModule);
      });

      describe('when called', () => {
        let result: PlanInspection;

        beforeAll(() => {
          result = container.inspectCurrentPlan(weaponServiceId);
        });

        it('should expose the container module id', () => {
          expect(getInstanceBindingInspection(result.root).moduleId).toBe(
            containerModule.id,
          );
        });
      });
    });

    describe('having services bound to a constant value, a dynamic value and a factory', () => {
      let dynamicValueBuilderMock: Mock<() => unknown>;
      let factoryBuilderMock: Mock<() => Factory<unknown>>;

      let container: Container;
      let constantValueBindingIdentifier: BindingIdentifier;
      let dynamicValueBindingIdentifier: BindingIdentifier;
      let factoryBindingIdentifier: BindingIdentifier;

      beforeAll(() => {
        dynamicValueBuilderMock = vitest.fn();
        factoryBuilderMock = vitest.fn();

        container = new Container();

        constantValueBindingIdentifier = container
          .bind('ConstantValue')
          .toConstantValue(Symbol())
          .getIdentifier();
        dynamicValueBindingIdentifier = container
          .bind('DynamicValue')
          .toDynamicValue(dynamicValueBuilderMock)
          .getIdentifier();
        factoryBindingIdentifier = container
          .bind<Factory<unknown>>('Factory')
          .toFactory(factoryBuilderMock)
          .getIdentifier();
      });

      describe('when called', () => {
        let constantValueResult: PlanInspection;
        let dynamicValueResult: PlanInspection;
        let factoryResult: PlanInspection;

        beforeAll(() => {
          constantValueResult = container.inspectCurrentPlan('ConstantValue');
          dynamicValueResult = container.inspectCurrentPlan('DynamicValue');
          factoryResult = container.inspectCurrentPlan('Factory');
        });

        it('should expose the constant value binding identity, type and scope only', () => {
          const expected: PlanBindingInspection = {
            id: constantValueBindingIdentifier.id,
            moduleId: undefined,
            scope: bindingScopeValues.Singleton,
            serviceIdentifier: 'ConstantValue',
            type: bindingTypeValues.ConstantValue,
          };

          expect(getBindingInspection(constantValueResult.root)).toStrictEqual(
            expected,
          );
        });

        it('should expose the dynamic value binding identity, type and scope only', () => {
          const expected: PlanBindingInspection = {
            id: dynamicValueBindingIdentifier.id,
            moduleId: undefined,
            scope: bindingScopeValues.Transient,
            serviceIdentifier: 'DynamicValue',
            type: bindingTypeValues.DynamicValue,
          };

          expect(getBindingInspection(dynamicValueResult.root)).toStrictEqual(
            expected,
          );
        });

        it('should expose the factory binding identity, type and scope only', () => {
          const expected: PlanBindingInspection = {
            id: factoryBindingIdentifier.id,
            moduleId: undefined,
            scope: bindingScopeValues.Singleton,
            serviceIdentifier: 'Factory',
            type: bindingTypeValues.Factory,
          };

          expect(getBindingInspection(factoryResult.root)).toStrictEqual(
            expected,
          );
        });

        it('should not call the dynamic value builder', () => {
          expect(dynamicValueBuilderMock).not.toHaveBeenCalled();
        });

        it('should not call the factory builder', () => {
          expect(factoryBuilderMock).not.toHaveBeenCalled();
        });
      });
    });

    describe('having a class with managed, unmanaged and property dependencies', () => {
      @injectable()
      class Katana {
        constructor(
          @inject(bladeServiceId)
          public readonly blade: unknown,
        ) {}
      }

      @injectable()
      class Ninja {
        @inject(throwableWeaponServiceId)
        public readonly shuriken!: unknown;

        constructor(
          @inject(weaponServiceId)
          public readonly weapon: unknown,
          @unmanaged()
          public readonly unmanagedValue: unknown,
        ) {}
      }

      let container: Container;

      beforeAll(() => {
        container = new Container();

        container.bind(bladeServiceId).toConstantValue(Symbol());
        container.bind(throwableWeaponServiceId).toConstantValue(Symbol());
        container.bind(weaponServiceId).to(Katana);
        container.bind(Ninja).toSelf();
      });

      describe('when called', () => {
        let result: PlanInspection;

        beforeAll(() => {
          result = container.inspectCurrentPlan(Ninja);
        });

        it('should inspect constructor arguments in order', () => {
          const constructorArguments: readonly (
            | PlanServiceInspection
            | undefined
          )[] = getInstanceBindingInspection(result.root).constructorArguments;

          expect(constructorArguments).toStrictEqual([
            expect.objectContaining({
              binding: expect.objectContaining({ implementationType: Katana }),
              serviceIdentifier: weaponServiceId,
            }),
            undefined,
          ]);
        });

        it('should inspect dependencies transitively', () => {
          const katanaInspection: InstanceBindingInspection =
            getInstanceBindingInspection(
              getInstanceBindingInspection(result.root).constructorArguments[0],
            );

          expect(katanaInspection.constructorArguments).toStrictEqual([
            expect.objectContaining({ serviceIdentifier: bladeServiceId }),
          ]);
        });

        it('should inspect managed properties only', () => {
          const properties: ReadonlyMap<
            string | symbol,
            PlanServiceInspection
          > = getInstanceBindingInspection(result.root).properties;

          expect([...properties.keys()]).toStrictEqual(['shuriken']);
          expect(properties.get('shuriken')).toStrictEqual(
            expect.objectContaining({
              serviceIdentifier: throwableWeaponServiceId,
            }),
          );
        });
      });
    });

    describe('having a service bound to a resolved value', () => {
      let resolvedValueFactoryMock: Mock<
        (weapon: unknown, shields: unknown[]) => unknown
      >;

      let container: Container;

      beforeAll(() => {
        resolvedValueFactoryMock = vitest.fn();

        container = new Container();

        container.bind(weaponServiceId).toConstantValue(Symbol());
        container.bind(shieldServiceId).toConstantValue(Symbol());
        container
          .bind(warriorServiceId)
          .toResolvedValue(resolvedValueFactoryMock, [
            weaponServiceId,
            { isMultiple: true, serviceIdentifier: shieldServiceId },
          ]);
      });

      describe('when called', () => {
        let result: PlanInspection;

        beforeAll(() => {
          result = container.inspectCurrentPlan(warriorServiceId);
        });

        it('should inspect the resolved value arguments', () => {
          expect(getBindingInspection(result.root)).toStrictEqual(
            expect.objectContaining({
              arguments: [
                expect.objectContaining({
                  isMultiple: false,
                  serviceIdentifier: weaponServiceId,
                }),
                expect.objectContaining({
                  isMultiple: true,
                  serviceIdentifier: shieldServiceId,
                }),
              ],
              type: bindingTypeValues.ResolvedValue,
            }),
          );
        });

        it('should not call the resolved value factory', () => {
          expect(resolvedValueFactoryMock).not.toHaveBeenCalled();
        });
      });
    });

    describe('having a service redirected to a class bound to itself', () => {
      @injectable()
      class Katana {}

      let container: Container;

      beforeAll(() => {
        container = new Container();

        container.bind(weaponServiceId).toService(Katana);
        container.bind(Katana).toSelf();
      });

      describe('when called, with optional true', () => {
        let result: PlanInspection;

        beforeAll(() => {
          result = container.inspectCurrentPlan(weaponServiceId, {
            optional: true,
          });
        });

        it('should inspect the redirection with the request constraints', () => {
          expect(getBindingInspection(result.root)).toStrictEqual(
            expect.objectContaining({
              redirection: expect.objectContaining({
                binding: expect.objectContaining({
                  implementationType: Katana,
                }),
                optional: true,
                serviceIdentifier: Katana,
              }),
              targetServiceIdentifier: Katana,
              type: bindingTypeValues.ServiceRedirection,
            }),
          );
        });
      });
    });

    describe('having a service bound depending on the parent', () => {
      @injectable()
      class Katana {}

      @injectable()
      class Bow {}

      @injectable()
      class Ninja {
        constructor(
          @inject(weaponServiceId)
          public readonly weapon: unknown,
        ) {}
      }

      @injectable()
      class Archer {
        constructor(
          @inject(weaponServiceId)
          public readonly weapon: unknown,
        ) {}
      }

      let container: Container;

      beforeAll(() => {
        container = new Container();

        container.bind(weaponServiceId).to(Katana).whenParentIs(Ninja);
        container.bind(weaponServiceId).to(Bow).whenParentIs(Archer);
        container.bind(Ninja).toSelf();
        container.bind(Archer).toSelf();
      });

      describe('when called', () => {
        let ninjaResult: PlanInspection;
        let archerResult: PlanInspection;

        beforeAll(() => {
          ninjaResult = container.inspectCurrentPlan(Ninja);
          archerResult = container.inspectCurrentPlan(Archer);
        });

        it('should select the binding for each parent', () => {
          expect(
            getInstanceBindingInspection(
              getInstanceBindingInspection(ninjaResult.root)
                .constructorArguments[0],
            ).implementationType,
          ).toBe(Katana);
          expect(
            getInstanceBindingInspection(
              getInstanceBindingInspection(archerResult.root)
                .constructorArguments[0],
            ).implementationType,
          ).toBe(Bow);
        });
      });
    });

    describe('having a plugin observing plans', () => {
      @injectable()
      class Katana {}

      let getPlanOptionsList: GetPlanOptions[];
      let container: Container;

      beforeAll(() => {
        getPlanOptionsList = [];

        class PlanObserverPlugin extends Plugin<Container> {
          public load(api: PluginApi): void {
            api.onPlan((options: GetPlanOptions): void => {
              getPlanOptionsList.push(options);
            });
          }
        }

        container = new Container();

        container.register(PlanObserverPlugin);

        container.bind(weaponServiceId).to(Katana);
      });

      describe('when called, and container.get() is called', () => {
        beforeAll(() => {
          container.inspectCurrentPlan(weaponServiceId);
          container.get(weaponServiceId);
        });

        it('should notify the plan once', () => {
          expect(getPlanOptionsList).toStrictEqual([
            expect.objectContaining({ serviceIdentifier: weaponServiceId }),
          ]);
        });
      });
    });

    describe('having a child container whose parent binds the service', () => {
      @injectable()
      class Katana {}

      let container: Container;
      let bindingIdentifier: BindingIdentifier;

      beforeAll(() => {
        const parentContainer: Container = new Container();

        bindingIdentifier = parentContainer
          .bind(weaponServiceId)
          .to(Katana)
          .getIdentifier();

        container = new Container({ parent: parentContainer });
      });

      describe('when called', () => {
        let result: PlanInspection;

        beforeAll(() => {
          result = container.inspectCurrentPlan(weaponServiceId);
        });

        it('should inspect the parent binding', () => {
          expect(getInstanceBindingInspection(result.root)).toStrictEqual(
            expect.objectContaining({
              id: bindingIdentifier.id,
              implementationType: Katana,
            }),
          );
        });
      });
    });

    describe('having a class with an unbound dependency', () => {
      @injectable()
      class Ninja {
        constructor(
          @inject(weaponServiceId)
          public readonly weapon: unknown,
        ) {}
      }

      let container: Container;

      beforeAll(() => {
        container = new Container();

        container.bind(Ninja).toSelf();
      });

      describe('when called', () => {
        let result: unknown;
        let getError: unknown;

        beforeAll(() => {
          result = captureError(() => container.inspectCurrentPlan(Ninja));
          getError = captureError(() => container.get(Ninja));
        });

        it('should throw the error container.get() throws', () => {
          expect(result).toBeInstanceOf(InversifyCoreError);
          expect(result).toStrictEqual(getError);
        });
      });
    });

    describe('having a service bound to a class', () => {
      @injectable()
      class Katana {}

      @injectable()
      class Shuriken {}

      let container: Container;

      beforeAll(() => {
        container = new Container();

        container.bind(weaponServiceId).to(Katana);
      });

      describe('when called, and the service is rebound, and called again', () => {
        let firstResult: PlanInspection;
        let secondResult: PlanInspection;

        beforeAll(() => {
          firstResult = container.inspectCurrentPlan(weaponServiceId);

          container.rebind(weaponServiceId).to(Shuriken);

          secondResult = container.inspectCurrentPlan(weaponServiceId);
        });

        it('should keep the first inspection unchanged', () => {
          expect(
            getInstanceBindingInspection(firstResult.root).implementationType,
          ).toBe(Katana);
        });

        it('should reflect the rebinding in the second inspection', () => {
          expect(
            getInstanceBindingInspection(secondResult.root).implementationType,
          ).toBe(Shuriken);
        });
      });
    });

    describe('having classes sharing a context free dependency', () => {
      @injectable()
      class Katana {
        constructor(
          @inject(materialServiceId)
          public readonly material: unknown,
        ) {}
      }

      @injectable()
      class Buckler {
        constructor(
          @inject(materialServiceId)
          public readonly material: unknown,
        ) {}
      }

      @injectable()
      class Ninja {
        constructor(
          @inject(weaponServiceId)
          public readonly weapon: unknown,
          @inject(shieldServiceId)
          public readonly shield: unknown,
        ) {}
      }

      let container: Container;

      beforeAll(() => {
        container = new Container();

        container.bind(materialServiceId).toConstantValue(Symbol());
        container.bind(weaponServiceId).to(Katana);
        container.bind(shieldServiceId).to(Buckler);
        container.bind(Ninja).toSelf();
      });

      describe('when called', () => {
        let result: PlanInspection;

        beforeAll(() => {
          result = container.inspectCurrentPlan(Ninja);
        });

        it('should return the same service inspection for the shared dependency', () => {
          const [weaponInspection, shieldInspection]: readonly (
            | PlanServiceInspection
            | undefined
          )[] = getInstanceBindingInspection(result.root).constructorArguments;

          expect(
            getInstanceBindingInspection(weaponInspection)
              .constructorArguments[0],
          ).toBe(
            getInstanceBindingInspection(shieldInspection)
              .constructorArguments[0],
          );
        });
      });
    });

    describe('having a container constructed with autobind', () => {
      let constructorMock: Mock<() => void>;

      @injectable()
      class Katana {
        constructor() {
          constructorMock();
        }
      }

      let container: Container;

      beforeAll(() => {
        constructorMock = vitest.fn();

        container = new Container({
          autobind: true,
          defaultScope: bindingScopeValues.Singleton,
        });
      });

      describe('when called', () => {
        let result: PlanInspection;

        beforeAll(() => {
          result = container.inspectCurrentPlan(Katana);
        });

        it('should inspect the autobound binding', () => {
          expect(getInstanceBindingInspection(result.root)).toStrictEqual(
            expect.objectContaining({
              implementationType: Katana,
              scope: bindingScopeValues.Singleton,
              serviceIdentifier: Katana,
              type: bindingTypeValues.Instance,
            }),
          );
        });

        it('should not construct the service', () => {
          expect(constructorMock).not.toHaveBeenCalled();
        });
      });

      describe('when called, and container.get() is called', () => {
        beforeAll(() => {
          container.inspectCurrentPlan(Katana);
          container.get(Katana);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should construct the service once', () => {
          expect(constructorMock).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('having a container constructed without autobind', () => {
      let constructorMock: Mock<() => void>;

      @injectable()
      class Katana {
        constructor() {
          constructorMock();
        }
      }

      let container: Container;

      beforeAll(() => {
        constructorMock = vitest.fn();

        container = new Container();
      });

      describe('when called, with autobind true', () => {
        let result: PlanInspection;

        beforeAll(() => {
          result = container.inspectCurrentPlan(Katana, { autobind: true });
        });

        it('should inspect the autobound binding', () => {
          expect(getInstanceBindingInspection(result.root)).toStrictEqual(
            expect.objectContaining({
              implementationType: Katana,
              scope: bindingScopeValues.Transient,
              serviceIdentifier: Katana,
              type: bindingTypeValues.Instance,
            }),
          );
        });

        it('should not construct the service', () => {
          expect(constructorMock).not.toHaveBeenCalled();
        });
      });
    });

    describe('having a class that depends on itself', () => {
      @injectable()
      class Katana {
        constructor(
          @inject(Katana)
          public readonly katana: Katana,
        ) {}
      }

      let container: Container;

      beforeAll(() => {
        container = new Container();

        container.bind(Katana).toSelf();
      });

      describe('when called', () => {
        let result: unknown;
        let getError: unknown;

        beforeAll(() => {
          result = captureError(() => container.inspectCurrentPlan(Katana));
          getError = captureError(() => container.get(Katana));
        });

        it('should throw the error container.get() throws', () => {
          expect(result).toBeInstanceOf(InversifyCoreError);
          expect(result).toStrictEqual(
            expect.objectContaining({
              message: expect.stringContaining('Circular dependency found'),
            }),
          );
          expect(result).toStrictEqual(getError);
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
            await container.unbindAsync(Ninja);
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
