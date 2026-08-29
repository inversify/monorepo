import { describe, expect, it } from 'vitest';

import { type Newable, type ServiceIdentifier } from '@inversifyjs/common';
import {
  type BindInWhenOnFluentSyntax,
  Container,
} from '@inversifyjs/container';
import {
  type BindingActivation,
  type Inject,
  type Injectable,
  type ResolutionContext,
} from '@inversifyjs/core';

const CONSTRUCTOR_ARITIES: number[] = [0, 1, 2, 3, 4, 5];
const PROPERTY_ARITIES: number[] = [0, 1, 2, 3, 4, 5];

// Dependency token classes used as service identifiers
class Dependency0 {}
class Dependency1 {}
class Dependency2 {}
class Dependency3 {}
class Dependency4 {}

const DEPENDENCY_CLASSES: Newable<unknown>[] = [
  Dependency0,
  Dependency1,
  Dependency2,
  Dependency3,
  Dependency4,
];

// Property-specific dependency tokens for the combined injection test
class PropertyDependency0 {}
class PropertyDependency1 {}
class PropertyDependency2 {}

function buildExpectedArgs(parameterCount: number): string[] {
  return Array.from(
    { length: parameterCount },
    (_value: undefined, index: number): string => `value-${index.toString()}`,
  );
}

function buildPropertyKey(index: number): string {
  return `property${index.toString()}`;
}

interface ArgsCapturingInstance {
  activatedByBinding: boolean;
  activatedByService: boolean;
  args: unknown[];
}

interface PropertiesCapturingInstance {
  [propertyKey: string]: unknown;
  activatedByBinding: boolean;
  activatedByService: boolean;
}

// Static service classes for each constructor arity (0–5)
class ArgsCapturing0 implements ArgsCapturingInstance, Injectable {
  public activatedByBinding: boolean = false;
  public activatedByService: boolean = false;
  public readonly args: unknown[] = [];
}

class ArgsCapturing1 implements ArgsCapturingInstance, Injectable {
  public activatedByBinding: boolean = false;
  public activatedByService: boolean = false;
  public readonly args: unknown[];

  constructor(dep0: Inject<Dependency0>) {
    this.args = [dep0];
  }
}

class ArgsCapturing2 implements ArgsCapturingInstance, Injectable {
  public activatedByBinding: boolean = false;
  public activatedByService: boolean = false;
  public readonly args: unknown[];

  constructor(dep0: Inject<Dependency0>, dep1: Inject<Dependency1>) {
    this.args = [dep0, dep1];
  }
}

class ArgsCapturing3 implements ArgsCapturingInstance, Injectable {
  public activatedByBinding: boolean = false;
  public activatedByService: boolean = false;
  public readonly args: unknown[];

  constructor(
    dep0: Inject<Dependency0>,
    dep1: Inject<Dependency1>,
    dep2: Inject<Dependency2>,
  ) {
    this.args = [dep0, dep1, dep2];
  }
}

class ArgsCapturing4 implements ArgsCapturingInstance, Injectable {
  public activatedByBinding: boolean = false;
  public activatedByService: boolean = false;
  public readonly args: unknown[];

  constructor(
    dep0: Inject<Dependency0>,
    dep1: Inject<Dependency1>,
    dep2: Inject<Dependency2>,
    dep3: Inject<Dependency3>,
  ) {
    this.args = [dep0, dep1, dep2, dep3];
  }
}

class ArgsCapturing5 implements ArgsCapturingInstance, Injectable {
  public activatedByBinding: boolean = false;
  public activatedByService: boolean = false;
  public readonly args: unknown[];

  constructor(
    dep0: Inject<Dependency0>,
    dep1: Inject<Dependency1>,
    dep2: Inject<Dependency2>,
    dep3: Inject<Dependency3>,
    dep4: Inject<Dependency4>,
  ) {
    this.args = [dep0, dep1, dep2, dep3, dep4];
  }
}

const ARGS_CAPTURING_CLASSES: Newable<ArgsCapturingInstance>[] = [
  ArgsCapturing0,
  ArgsCapturing1,
  ArgsCapturing2,
  ArgsCapturing3,
  ArgsCapturing4,
  ArgsCapturing5,
];

// Static service classes for each property injection arity (0–5)
class PropsCapturing0 implements PropertiesCapturingInstance, Injectable {
  [propertyKey: string]: unknown;
  public activatedByBinding: boolean = false;
  public activatedByService: boolean = false;
}

class PropsCapturing1 implements PropertiesCapturingInstance, Injectable {
  [propertyKey: string]: unknown;
  public activatedByBinding: boolean = false;
  public activatedByService: boolean = false;
  public property0!: Inject<Dependency0>;
}

class PropsCapturing2 implements PropertiesCapturingInstance, Injectable {
  [propertyKey: string]: unknown;
  public activatedByBinding: boolean = false;
  public activatedByService: boolean = false;
  public property0!: Inject<Dependency0>;
  public property1!: Inject<Dependency1>;
}

class PropsCapturing3 implements PropertiesCapturingInstance, Injectable {
  [propertyKey: string]: unknown;
  public activatedByBinding: boolean = false;
  public activatedByService: boolean = false;
  public property0!: Inject<Dependency0>;
  public property1!: Inject<Dependency1>;
  public property2!: Inject<Dependency2>;
}

class PropsCapturing4 implements PropertiesCapturingInstance, Injectable {
  [propertyKey: string]: unknown;
  public activatedByBinding: boolean = false;
  public activatedByService: boolean = false;
  public property0!: Inject<Dependency0>;
  public property1!: Inject<Dependency1>;
  public property2!: Inject<Dependency2>;
  public property3!: Inject<Dependency3>;
}

class PropsCapturing5 implements PropertiesCapturingInstance, Injectable {
  [propertyKey: string]: unknown;
  public activatedByBinding: boolean = false;
  public activatedByService: boolean = false;
  public property0!: Inject<Dependency0>;
  public property1!: Inject<Dependency1>;
  public property2!: Inject<Dependency2>;
  public property3!: Inject<Dependency3>;
  public property4!: Inject<Dependency4>;
}

const PROPS_CAPTURING_CLASSES: Newable<PropertiesCapturingInstance>[] = [
  PropsCapturing0,
  PropsCapturing1,
  PropsCapturing2,
  PropsCapturing3,
  PropsCapturing4,
  PropsCapturing5,
];

// Combined class for mixed constructor + property injection test
class ArgsAndPropsCapturing
  implements ArgsCapturingInstance, PropertiesCapturingInstance, Injectable
{
  [propertyKey: string]: unknown;
  public activatedByBinding: boolean = false;
  public activatedByService: boolean = false;
  public readonly args: unknown[];
  public property0!: Inject<PropertyDependency0>;
  public property1!: Inject<PropertyDependency1>;
  public property2!: Inject<PropertyDependency2>;

  constructor(dep0: Inject<Dependency0>, dep1: Inject<Dependency1>) {
    this.args = [dep0, dep1];
  }
}

function buildArgsCapturingResolvedValueFactory(): (
  ...args: unknown[]
) => ArgsCapturingInstance {
  return (...args: unknown[]): ArgsCapturingInstance => ({
    activatedByBinding: false,
    activatedByService: false,
    args,
  });
}

type ServiceKind = 'instance' | 'resolved-value';

interface ResolutionCase {
  bindDependencies: (container: Container) => void;
  description: string;
  kind: ServiceKind;
  resolveService: (
    container: Container,
    serviceIdentifier: ServiceIdentifier<ArgsCapturingInstance>,
  ) => ArgsCapturingInstance | Promise<ArgsCapturingInstance>;
}

function buildResolutionCases(
  bindSyncDependencies: (container: Container) => void,
  bindAsyncDependencies: (container: Container) => void,
): ResolutionCase[] {
  return [
    {
      bindDependencies: bindSyncDependencies,
      description: 'instance, sync',
      kind: 'instance',
      resolveService: (
        container: Container,
        serviceIdentifier: ServiceIdentifier<ArgsCapturingInstance>,
      ): ArgsCapturingInstance => container.get(serviceIdentifier),
    },
    {
      bindDependencies: bindAsyncDependencies,
      description: 'instance, async',
      kind: 'instance',
      resolveService: async (
        container: Container,
        serviceIdentifier: ServiceIdentifier<ArgsCapturingInstance>,
      ): Promise<ArgsCapturingInstance> =>
        container.getAsync(serviceIdentifier),
    },
    {
      bindDependencies: bindSyncDependencies,
      description: 'resolved value, sync',
      kind: 'resolved-value',
      resolveService: (
        container: Container,
        serviceIdentifier: ServiceIdentifier<ArgsCapturingInstance>,
      ): ArgsCapturingInstance => container.get(serviceIdentifier),
    },
    {
      bindDependencies: bindAsyncDependencies,
      description: 'resolved value, async',
      kind: 'resolved-value',
      resolveService: async (
        container: Container,
        serviceIdentifier: ServiceIdentifier<ArgsCapturingInstance>,
      ): Promise<ArgsCapturingInstance> =>
        container.getAsync(serviceIdentifier),
    },
  ];
}

interface ActivationScenario {
  description: string;
  useBindingActivation: boolean;
  useServiceActivation: boolean;
}

const ACTIVATION_SCENARIOS: ActivationScenario[] = [
  {
    description: 'without a binding or a service activation',
    useBindingActivation: false,
    useServiceActivation: false,
  },
  {
    description: 'with a service activation only',
    useBindingActivation: false,
    useServiceActivation: true,
  },
  {
    description: 'with a binding activation only',
    useBindingActivation: true,
    useServiceActivation: false,
  },
  {
    description: 'with both a binding and a service activation',
    useBindingActivation: true,
    useServiceActivation: true,
  },
];

function buildBindingActivation(): BindingActivation<ArgsCapturingInstance> {
  return (
    _context: ResolutionContext,
    resolved: ArgsCapturingInstance,
  ): ArgsCapturingInstance => {
    resolved.activatedByBinding = true;

    return resolved;
  };
}

function buildServiceActivation(): (
  context: ResolutionContext,
  resolved: ArgsCapturingInstance,
) => ArgsCapturingInstance {
  return (
    _context: ResolutionContext,
    resolved: ArgsCapturingInstance,
  ): ArgsCapturingInstance => {
    resolved.activatedByService = true;

    return resolved;
  };
}

function bindService(
  container: Container,
  kind: ServiceKind,
  serviceClass: Newable<ArgsCapturingInstance>,
  dependencyClasses: Newable<unknown>[],
  resolvedValueServiceId: string,
  scenario: ActivationScenario,
): ServiceIdentifier<ArgsCapturingInstance> {
  if (kind === 'instance') {
    const bindingSyntax: BindInWhenOnFluentSyntax<ArgsCapturingInstance> =
      container.bind(serviceClass).toSelf();

    if (scenario.useBindingActivation) {
      bindingSyntax.onActivation(buildBindingActivation());
    }

    if (scenario.useServiceActivation) {
      container.onActivation(serviceClass, buildServiceActivation());
    }

    return serviceClass;
  }

  const bindingSyntax: BindInWhenOnFluentSyntax<ArgsCapturingInstance> =
    container
      .bind<ArgsCapturingInstance>(resolvedValueServiceId)
      .toResolvedValue(
        buildArgsCapturingResolvedValueFactory(),
        dependencyClasses as ServiceIdentifier<unknown>[],
      );

  if (scenario.useBindingActivation) {
    bindingSyntax.onActivation(buildBindingActivation());
  }

  if (scenario.useServiceActivation) {
    container.onActivation(resolvedValueServiceId, buildServiceActivation());
  }

  return resolvedValueServiceId;
}

describe(Container, () => {
  describe.each(CONSTRUCTOR_ARITIES)(
    'having a service with %s constructor/factory parameters',
    (parameterCount: number) => {
      const dependencyClasses: Newable<unknown>[] = DEPENDENCY_CLASSES.slice(
        0,
        parameterCount,
      );
      const serviceClass: Newable<ArgsCapturingInstance> =
        ARGS_CAPTURING_CLASSES[parameterCount]!;
      const expectedArgs: string[] = buildExpectedArgs(parameterCount);
      const resolvedValueServiceId: string = 'resolved-value-service';

      function bindSyncDependencies(container: Container): void {
        dependencyClasses.forEach(
          (depClass: Newable<unknown>, index: number): void => {
            container
              .bind(depClass)
              .toConstantValue(expectedArgs[index] as string as never);
          },
        );
      }

      function bindAsyncDependencies(container: Container): void {
        dependencyClasses.forEach(
          (depClass: Newable<unknown>, index: number): void => {
            container
              .bind(depClass)
              .toDynamicValue(
                async () =>
                  Promise.resolve(expectedArgs[index] as string) as never,
              );
          },
        );
      }

      describe.each(ACTIVATION_SCENARIOS)(
        '$description',
        (scenario: ActivationScenario) => {
          it.each(
            buildResolutionCases(bindSyncDependencies, bindAsyncDependencies),
          )(
            'should resolve a $description binding when called',
            async ({
              kind,
              bindDependencies,
              resolveService,
            }: ResolutionCase) => {
              const container: Container = new Container({
                jitless: true,
              });

              bindDependencies(container);

              const serviceIdentifier: ServiceIdentifier<ArgsCapturingInstance> =
                bindService(
                  container,
                  kind,
                  serviceClass,
                  dependencyClasses,
                  resolvedValueServiceId,
                  scenario,
                );

              const instance: ArgsCapturingInstance = await resolveService(
                container,
                serviceIdentifier,
              );

              expect(instance.args).toStrictEqual(expectedArgs);
              expect(instance.activatedByBinding).toBe(
                scenario.useBindingActivation,
              );
              expect(instance.activatedByService).toBe(
                scenario.useServiceActivation,
              );
            },
          );
        },
      );

      describe('with activation added after binding', () => {
        it.each(
          buildResolutionCases(bindSyncDependencies, bindAsyncDependencies),
        )(
          'should activate a $description binding when called, and a service activation is added after the plan is cached',
          async ({
            kind,
            bindDependencies,
            resolveService,
          }: ResolutionCase) => {
            const container: Container = new Container({
              jitless: true,
            });

            bindDependencies(container);

            const serviceIdentifier: ServiceIdentifier<ArgsCapturingInstance> =
              bindService(
                container,
                kind,
                serviceClass,
                dependencyClasses,
                resolvedValueServiceId,
                {
                  description: 'without a binding or a service activation',
                  useBindingActivation: false,
                  useServiceActivation: false,
                },
              );

            const instanceBeforeActivation: ArgsCapturingInstance =
              await resolveService(container, serviceIdentifier);

            expect(instanceBeforeActivation.args).toStrictEqual(expectedArgs);
            expect(instanceBeforeActivation.activatedByBinding).toBe(false);
            expect(instanceBeforeActivation.activatedByService).toBe(false);

            container.onActivation(serviceIdentifier, buildServiceActivation());

            const instanceAfterActivation: ArgsCapturingInstance =
              await resolveService(container, serviceIdentifier);

            expect(instanceAfterActivation.args).toStrictEqual(expectedArgs);
            expect(instanceAfterActivation.activatedByBinding).toBe(false);
            expect(instanceAfterActivation.activatedByService).toBe(true);
          },
        );
      });
    },
  );

  describe.each(PROPERTY_ARITIES)(
    'having a transient instance service with %s property injections and no constructor parameters',
    (propertyCount: number) => {
      const dependencyClasses: Newable<unknown>[] = DEPENDENCY_CLASSES.slice(
        0,
        propertyCount,
      );
      const expectedValues: string[] = buildExpectedArgs(propertyCount);

      it('should resolve property injections when called', () => {
        const container: Container = new Container({
          jitless: true,
        });

        dependencyClasses.forEach(
          (depClass: Newable<unknown>, index: number): void => {
            container
              .bind(depClass)
              .toConstantValue(expectedValues[index] as string as never);
          },
        );

        const serviceClass: Newable<PropertiesCapturingInstance> =
          PROPS_CAPTURING_CLASSES[propertyCount]!;

        container.bind(serviceClass).toSelf().inTransientScope();

        const instance: PropertiesCapturingInstance =
          container.get(serviceClass);

        dependencyClasses.forEach(
          (_depClass: Newable<unknown>, index: number): void => {
            expect(instance[buildPropertyKey(index)]).toBe(
              expectedValues[index],
            );
          },
        );
      });
    },
  );

  it('should resolve a transient instance service with two constructor parameters and three property injections when called', () => {
    const expectedConstructorArgs: string[] = buildExpectedArgs(2);
    const expectedPropertyValues: string[] = [
      'property-value-0',
      'property-value-1',
      'property-value-2',
    ];

    const container: Container = new Container({
      jitless: true,
    });

    const constructorDepClasses: Newable<unknown>[] = [
      Dependency0,
      Dependency1,
    ];
    const propertyDepClasses: Newable<unknown>[] = [
      PropertyDependency0,
      PropertyDependency1,
      PropertyDependency2,
    ];

    constructorDepClasses.forEach(
      (depClass: Newable<unknown>, index: number): void => {
        container
          .bind(depClass)
          .toConstantValue(expectedConstructorArgs[index] as string as never);
      },
    );

    propertyDepClasses.forEach(
      (depClass: Newable<unknown>, index: number): void => {
        container
          .bind(depClass)
          .toConstantValue(expectedPropertyValues[index] as string as never);
      },
    );

    container.bind(ArgsAndPropsCapturing).toSelf().inTransientScope();

    const instance: ArgsCapturingInstance & PropertiesCapturingInstance =
      container.get(ArgsAndPropsCapturing);

    expect(instance.args).toStrictEqual(expectedConstructorArgs);

    propertyDepClasses.forEach(
      (_depClass: Newable<unknown>, index: number): void => {
        expect(instance[buildPropertyKey(index)]).toBe(
          expectedPropertyValues[index],
        );
      },
    );
  });
});
