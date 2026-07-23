import { describe, expect, it } from 'vitest';

import { type Newable, type ServiceIdentifier } from '@inversifyjs/common';
import {
  type BindInWhenOnFluentSyntax,
  Container,
} from '@inversifyjs/container';
import {
  type BindingActivation,
  inject,
  injectable,
  type ResolutionContext,
} from '@inversifyjs/core';

const CONSTRUCTOR_ARITIES: number[] = [0, 1, 2, 3, 4, 5];
const PROPERTY_ARITIES: number[] = [0, 1, 2, 3, 4, 5];

function buildDependencyIdentifiers(parameterCount: number): string[] {
  return Array.from(
    { length: parameterCount },
    (_value: undefined, index: number): string =>
      `dependency-${index.toString()}`,
  );
}

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

function buildArgsCapturingClass(
  dependencyIds: string[],
): Newable<ArgsCapturingInstance> {
  class ArgsCapturingService implements ArgsCapturingInstance {
    public activatedByBinding: boolean = false;
    public activatedByService: boolean = false;
    public readonly args: unknown[];

    constructor(...args: unknown[]) {
      this.args = args;
    }
  }

  injectable()(ArgsCapturingService);

  dependencyIds.forEach((dependencyId: string, index: number): void => {
    inject(dependencyId)(ArgsCapturingService, undefined, index);
  });

  return ArgsCapturingService;
}

function buildPropertiesCapturingClass(
  dependencyIds: string[],
): Newable<PropertiesCapturingInstance> {
  class PropertiesCapturingService implements PropertiesCapturingInstance {
    [propertyKey: string]: unknown;

    public activatedByBinding: boolean = false;
    public activatedByService: boolean = false;
  }

  injectable()(PropertiesCapturingService);

  dependencyIds.forEach((dependencyId: string, index: number): void => {
    inject(dependencyId)(
      PropertiesCapturingService.prototype,
      buildPropertyKey(index),
    );
  });

  return PropertiesCapturingService;
}

function buildArgsAndPropertiesCapturingClass(
  constructorDependencyIds: string[],
  propertyDependencyIds: string[],
): Newable<ArgsCapturingInstance & PropertiesCapturingInstance> {
  class ArgsAndPropertiesCapturingService
    implements ArgsCapturingInstance, PropertiesCapturingInstance
  {
    [propertyKey: string]: unknown;

    public activatedByBinding: boolean = false;
    public activatedByService: boolean = false;
    public readonly args: unknown[];

    constructor(...args: unknown[]) {
      this.args = args;
    }
  }

  injectable()(ArgsAndPropertiesCapturingService);

  constructorDependencyIds.forEach(
    (dependencyId: string, index: number): void => {
      inject(dependencyId)(ArgsAndPropertiesCapturingService, undefined, index);
    },
  );

  propertyDependencyIds.forEach((dependencyId: string, index: number): void => {
    inject(dependencyId)(
      ArgsAndPropertiesCapturingService.prototype,
      buildPropertyKey(index),
    );
  });

  return ArgsAndPropertiesCapturingService;
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
  dependencyIds: string[],
  resolvedValueServiceId: string,
  scenario: ActivationScenario,
): ServiceIdentifier<ArgsCapturingInstance> {
  if (kind === 'instance') {
    const serviceClass: Newable<ArgsCapturingInstance> =
      buildArgsCapturingClass(dependencyIds);
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
      .toResolvedValue(buildArgsCapturingResolvedValueFactory(), dependencyIds);

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
      const dependencyIds: string[] =
        buildDependencyIdentifiers(parameterCount);
      const expectedArgs: string[] = buildExpectedArgs(parameterCount);
      const resolvedValueServiceId: string = 'resolved-value-service';

      function bindSyncDependencies(container: Container): void {
        dependencyIds.forEach((dependencyId: string, index: number): void => {
          container
            .bind<string>(dependencyId)
            .toConstantValue(expectedArgs[index] as string);
        });
      }

      function bindAsyncDependencies(container: Container): void {
        dependencyIds.forEach((dependencyId: string, index: number): void => {
          container
            .bind<string>(dependencyId)
            .toDynamicValue(async () =>
              Promise.resolve(expectedArgs[index] as string),
            );
        });
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
                  dependencyIds,
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
                dependencyIds,
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
      const dependencyIds: string[] = buildDependencyIdentifiers(propertyCount);
      const expectedValues: string[] = buildExpectedArgs(propertyCount);

      it('should resolve property injections when called', () => {
        const container: Container = new Container({
          jitless: true,
        });

        dependencyIds.forEach((dependencyId: string, index: number): void => {
          container
            .bind<string>(dependencyId)
            .toConstantValue(expectedValues[index] as string);
        });

        const serviceClass: Newable<PropertiesCapturingInstance> =
          buildPropertiesCapturingClass(dependencyIds);

        container.bind(serviceClass).toSelf().inTransientScope();

        const instance: PropertiesCapturingInstance =
          container.get(serviceClass);

        dependencyIds.forEach((_dependencyId: string, index: number): void => {
          expect(instance[buildPropertyKey(index)]).toBe(expectedValues[index]);
        });
      });
    },
  );

  it('should resolve a transient instance service with two constructor parameters and three property injections when called', () => {
    const constructorDependencyIds: string[] = buildDependencyIdentifiers(2);
    const propertyDependencyIds: string[] = [
      'property-dependency-0',
      'property-dependency-1',
      'property-dependency-2',
    ];
    const expectedConstructorArgs: string[] = buildExpectedArgs(2);
    const expectedPropertyValues: string[] = [
      'property-value-0',
      'property-value-1',
      'property-value-2',
    ];

    const container: Container = new Container({
      jitless: true,
    });

    constructorDependencyIds.forEach(
      (dependencyId: string, index: number): void => {
        container
          .bind<string>(dependencyId)
          .toConstantValue(expectedConstructorArgs[index] as string);
      },
    );

    propertyDependencyIds.forEach(
      (dependencyId: string, index: number): void => {
        container
          .bind<string>(dependencyId)
          .toConstantValue(expectedPropertyValues[index] as string);
      },
    );

    const serviceClass: Newable<
      ArgsCapturingInstance & PropertiesCapturingInstance
    > = buildArgsAndPropertiesCapturingClass(
      constructorDependencyIds,
      propertyDependencyIds,
    );

    container.bind(serviceClass).toSelf().inTransientScope();

    const instance: ArgsCapturingInstance & PropertiesCapturingInstance =
      container.get(serviceClass);

    expect(instance.args).toStrictEqual(expectedConstructorArgs);

    propertyDependencyIds.forEach(
      (_dependencyId: string, index: number): void => {
        expect(instance[buildPropertyKey(index)]).toBe(
          expectedPropertyValues[index],
        );
      },
    );
  });
});
