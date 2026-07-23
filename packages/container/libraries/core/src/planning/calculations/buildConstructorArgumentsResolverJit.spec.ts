import { beforeAll, describe, expect, it } from 'vitest';

import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type ClassElementMetadata } from '../../metadata/models/ClassElementMetadata.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { buildConstructorArgumentsResolverJit } from './buildConstructorArgumentsResolverJit.js';
import { buildResolveMany } from './buildResolveMany.js';
import { resolveFour } from './resolveFour.js';
import { resolveThree } from './resolveThree.js';
import { resolveTwo } from './resolveTwo.js';

class Foo {
  public readonly args: unknown[];

  constructor(...args: unknown[]) {
    this.args = args;
  }
}

type FooWithProperties = Foo & Record<string | symbol, unknown>;

interface PropertyFixture {
  key: string | symbol;
  value: string;
}

function buildNodeFixtureForArguments(
  length: number,
  propertyFixtures: PropertyFixture[] = [],
): InstanceBindingNode<Foo, InstanceBinding<Foo>> {
  const properties: Map<string | symbol, ClassElementMetadata> = new Map<
    string | symbol,
    ClassElementMetadata
  >();

  for (const propertyFixture of propertyFixtures) {
    properties.set(
      propertyFixture.key,
      Symbol() as unknown as ClassElementMetadata,
    );
  }

  const propertyParams: Map<string | symbol, PlanServiceNode> = new Map<
    string | symbol,
    PlanServiceNode
  >();

  return {
    classMetadata: {
      constructorArguments: new Array<ClassElementMetadata>(length).fill(
        Symbol() as unknown as ClassElementMetadata,
      ),
      lifecycle: {
        postConstructMethodNames: new Set(),
        preDestroyMethodNames: new Set(),
      },
      properties,
      scope: undefined,
    },
    constructorParams: [] as PlanServiceNode[],
    propertyParams,
  } as Partial<
    InstanceBindingNode<Foo, InstanceBinding<Foo>>
  > as InstanceBindingNode<Foo, InstanceBinding<Foo>>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResolveAsyncValues = (...args: any[]) => any;

describe(buildConstructorArgumentsResolverJit, () => {
  describe.each<[string, number, ResolveAsyncValues, string[]]>([
    ['two', 2, resolveTwo, ['value-0', 'value-1']],
    ['three', 3, resolveThree, ['value-0', 'value-1', 'value-2']],
    ['four', 4, resolveFour, ['value-0', 'value-1', 'value-2', 'value-3']],
  ])(
    'having %s constructor arguments',
    (
      _description: string,
      paramsCount: number,
      resolveAsyncValues: ResolveAsyncValues,
      valueFixtures: string[],
    ) => {
      let paramsFixture: ResolutionParams;

      beforeAll(() => {
        paramsFixture = Symbol() as unknown as ResolutionParams;
      });

      describe('when called, and resolveActivations is not provided', () => {
        describe('when called, and node.constructorParams is populated after the resolveNode is built', () => {
          let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

          let result: unknown;

          beforeAll(() => {
            nodeFixture = buildNodeFixtureForArguments(paramsCount);

            const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
              buildConstructorArgumentsResolverJit(
                nodeFixture,
                Foo,
                resolveAsyncValues,
              );

            nodeFixture.constructorParams.push(
              ...valueFixtures.map(
                (value: string): PlanServiceNode =>
                  ({
                    resolve: (): string => value,
                  }) as Partial<PlanServiceNode> as PlanServiceNode,
              ),
            );

            result = resolveNode(paramsFixture);
          });

          it('should build an instance with the resolved constructor arguments in order', () => {
            expect(result).toBeInstanceOf(Foo);
            expect((result as Foo).args).toStrictEqual(valueFixtures);
          });
        });

        describe('when called, and constructor arguments resolve asynchronously', () => {
          let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

          let result: unknown;

          beforeAll(async () => {
            nodeFixture = buildNodeFixtureForArguments(paramsCount);

            const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
              buildConstructorArgumentsResolverJit(
                nodeFixture,
                Foo,
                resolveAsyncValues,
              );

            nodeFixture.constructorParams.push(
              ...valueFixtures.map(
                (value: string): PlanServiceNode =>
                  ({
                    resolve: async (): Promise<string> => value,
                  }) as Partial<PlanServiceNode> as PlanServiceNode,
              ),
            );

            result = await resolveNode(paramsFixture);
          });

          it('should build an instance with the resolved constructor arguments in order', () => {
            expect(result).toBeInstanceOf(Foo);
            expect((result as Foo).args).toStrictEqual(valueFixtures);
          });
        });
      });

      describe('when called, and resolveActivations is provided', () => {
        let resolveActivations: (
          params: ResolutionParams,
          instance: Resolved<Foo>,
        ) => Resolved<Foo>;

        beforeAll(() => {
          resolveActivations = (
            _params: ResolutionParams,
            instance: Resolved<Foo>,
          ): Resolved<Foo> => instance;
        });

        describe('when called, and node.constructorParams is populated after the resolveNode is built', () => {
          let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

          let result: unknown;

          beforeAll(() => {
            nodeFixture = buildNodeFixtureForArguments(paramsCount);

            const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
              buildConstructorArgumentsResolverJit(
                nodeFixture,
                Foo,
                resolveAsyncValues,
                resolveActivations,
              );

            nodeFixture.constructorParams.push(
              ...valueFixtures.map(
                (value: string): PlanServiceNode =>
                  ({
                    resolve: (): string => value,
                  }) as Partial<PlanServiceNode> as PlanServiceNode,
              ),
            );

            result = resolveNode(paramsFixture);
          });

          it('should build an instance with the resolved constructor arguments in order', () => {
            expect(result).toBeInstanceOf(Foo);
            expect((result as Foo).args).toStrictEqual(valueFixtures);
          });
        });

        describe('when called, and constructor arguments resolve asynchronously', () => {
          let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

          let result: unknown;

          beforeAll(async () => {
            nodeFixture = buildNodeFixtureForArguments(paramsCount);

            const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
              buildConstructorArgumentsResolverJit(
                nodeFixture,
                Foo,
                resolveAsyncValues,
                resolveActivations,
              );

            nodeFixture.constructorParams.push(
              ...valueFixtures.map(
                (value: string): PlanServiceNode =>
                  ({
                    resolve: async (): Promise<string> => value,
                  }) as Partial<PlanServiceNode> as PlanServiceNode,
              ),
            );

            result = await resolveNode(paramsFixture);
          });

          it('should build an instance with the resolved constructor arguments in order', () => {
            expect(result).toBeInstanceOf(Foo);
            expect((result as Foo).args).toStrictEqual(valueFixtures);
          });
        });
      });
    },
  );

  describe.each<
    [string, number, ResolveAsyncValues, string[], PropertyFixture[]]
  >([
    [
      'two constructor arguments and two properties',
      2,
      resolveFour,
      ['value-0', 'value-1'],
      [
        { key: 'propertyA', value: 'property-0' },
        { key: 'propertyB', value: 'property-1' },
      ],
    ],
  ])(
    'having %s',
    (
      _description: string,
      paramsCount: number,
      resolveAsyncValues: ResolveAsyncValues,
      valueFixtures: string[],
      propertyFixtures: PropertyFixture[],
    ) => {
      let paramsFixture: ResolutionParams;

      beforeAll(() => {
        paramsFixture = Symbol() as unknown as ResolutionParams;
      });

      function populatePropertyResolvers(
        nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>,
        resolveAsync: boolean,
      ): void {
        for (const propertyFixture of propertyFixtures) {
          nodeFixture.propertyParams.set(propertyFixture.key, {
            bindings: [],
            resolve: resolveAsync
              ? async (resolveParams: ResolutionParams): Promise<string> => {
                  expect(resolveParams).toBe(paramsFixture);

                  return propertyFixture.value;
                }
              : (resolveParams: ResolutionParams): string => {
                  expect(resolveParams).toBe(paramsFixture);

                  return propertyFixture.value;
                },
          } as Partial<PlanServiceNode> as PlanServiceNode);
        }
      }

      describe('when called, and resolveActivations is not provided', () => {
        describe('when called, and node.constructorParams is populated after the resolveNode is built', () => {
          let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

          let result: unknown;

          beforeAll(() => {
            nodeFixture = buildNodeFixtureForArguments(
              paramsCount,
              propertyFixtures,
            );

            const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
              buildConstructorArgumentsResolverJit(
                nodeFixture,
                Foo,
                resolveAsyncValues,
              );

            nodeFixture.constructorParams.push(
              ...valueFixtures.map(
                (value: string): PlanServiceNode =>
                  ({
                    resolve: (): string => value,
                  }) as Partial<PlanServiceNode> as PlanServiceNode,
              ),
            );

            populatePropertyResolvers(nodeFixture, false);

            result = resolveNode(paramsFixture);
          });

          it('should build an instance with the resolved constructor arguments and properties in order', () => {
            expect(result).toBeInstanceOf(Foo);
            expect((result as Foo).args).toStrictEqual(valueFixtures);

            for (const propertyFixture of propertyFixtures) {
              expect((result as FooWithProperties)[propertyFixture.key]).toBe(
                propertyFixture.value,
              );
            }
          });
        });

        describe('when called, and constructor arguments and properties resolve asynchronously', () => {
          let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

          let result: unknown;

          beforeAll(async () => {
            nodeFixture = buildNodeFixtureForArguments(
              paramsCount,
              propertyFixtures,
            );

            const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
              buildConstructorArgumentsResolverJit(
                nodeFixture,
                Foo,
                resolveAsyncValues,
              );

            nodeFixture.constructorParams.push(
              ...valueFixtures.map(
                (value: string): PlanServiceNode =>
                  ({
                    resolve: async (): Promise<string> => value,
                  }) as Partial<PlanServiceNode> as PlanServiceNode,
              ),
            );

            populatePropertyResolvers(nodeFixture, true);

            result = await resolveNode(paramsFixture);
          });

          it('should build an instance with the resolved constructor arguments and properties in order', () => {
            expect(result).toBeInstanceOf(Foo);
            expect((result as Foo).args).toStrictEqual(valueFixtures);

            for (const propertyFixture of propertyFixtures) {
              expect((result as FooWithProperties)[propertyFixture.key]).toBe(
                propertyFixture.value,
              );
            }
          });
        });
      });

      describe('when called, and resolveActivations is provided', () => {
        let resolveActivations: (
          params: ResolutionParams,
          instance: Resolved<Foo>,
        ) => Resolved<Foo>;

        beforeAll(() => {
          resolveActivations = (
            _params: ResolutionParams,
            instance: Resolved<Foo>,
          ): Resolved<Foo> => instance;
        });

        describe('when called, and node.constructorParams is populated after the resolveNode is built', () => {
          let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

          let result: unknown;

          beforeAll(() => {
            nodeFixture = buildNodeFixtureForArguments(
              paramsCount,
              propertyFixtures,
            );

            const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
              buildConstructorArgumentsResolverJit(
                nodeFixture,
                Foo,
                resolveAsyncValues,
                resolveActivations,
              );

            nodeFixture.constructorParams.push(
              ...valueFixtures.map(
                (value: string): PlanServiceNode =>
                  ({
                    resolve: (): string => value,
                  }) as Partial<PlanServiceNode> as PlanServiceNode,
              ),
            );

            populatePropertyResolvers(nodeFixture, false);

            result = resolveNode(paramsFixture);
          });

          it('should build an instance with the resolved constructor arguments and properties in order', () => {
            expect(result).toBeInstanceOf(Foo);
            expect((result as Foo).args).toStrictEqual(valueFixtures);

            for (const propertyFixture of propertyFixtures) {
              expect((result as FooWithProperties)[propertyFixture.key]).toBe(
                propertyFixture.value,
              );
            }
          });
        });

        describe('when called, and constructor arguments and properties resolve asynchronously', () => {
          let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

          let result: unknown;

          beforeAll(async () => {
            nodeFixture = buildNodeFixtureForArguments(
              paramsCount,
              propertyFixtures,
            );

            const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
              buildConstructorArgumentsResolverJit(
                nodeFixture,
                Foo,
                resolveAsyncValues,
                resolveActivations,
              );

            nodeFixture.constructorParams.push(
              ...valueFixtures.map(
                (value: string): PlanServiceNode =>
                  ({
                    resolve: async (): Promise<string> => value,
                  }) as Partial<PlanServiceNode> as PlanServiceNode,
              ),
            );

            populatePropertyResolvers(nodeFixture, true);

            result = await resolveNode(paramsFixture);
          });

          it('should build an instance with the resolved constructor arguments and properties in order', () => {
            expect(result).toBeInstanceOf(Foo);
            expect((result as Foo).args).toStrictEqual(valueFixtures);

            for (const propertyFixture of propertyFixtures) {
              expect((result as FooWithProperties)[propertyFixture.key]).toBe(
                propertyFixture.value,
              );
            }
          });
        });
      });
    },
  );

  describe('having two constructor arguments and one property with no bindings', () => {
    class FooWithDefaultProperty extends Foo {
      public propertyA: string = 'default-property-0';
    }

    const propertyKeyFixture: string = 'propertyA';

    let paramsFixture: ResolutionParams;

    beforeAll(() => {
      paramsFixture = Symbol() as unknown as ResolutionParams;
    });

    function buildNodeFixtureWithUnboundProperty(): InstanceBindingNode<
      FooWithDefaultProperty,
      InstanceBinding<FooWithDefaultProperty>
    > {
      const properties: Map<string | symbol, ClassElementMetadata> = new Map<
        string | symbol,
        ClassElementMetadata
      >([[propertyKeyFixture, Symbol() as unknown as ClassElementMetadata]]);

      const propertyParams: Map<string | symbol, PlanServiceNode> = new Map<
        string | symbol,
        PlanServiceNode
      >([
        [
          propertyKeyFixture,
          {
            bindings: undefined,
            resolve: (): string => {
              throw new Error(
                'resolve should not be called when the property has no bindings',
              );
            },
          } as Partial<PlanServiceNode> as PlanServiceNode,
        ],
      ]);

      return {
        classMetadata: {
          constructorArguments: new Array<ClassElementMetadata>(2).fill(
            Symbol() as unknown as ClassElementMetadata,
          ),
          lifecycle: {
            postConstructMethodNames: new Set(),
            preDestroyMethodNames: new Set(),
          },
          properties,
          scope: undefined,
        },
        constructorParams: [] as PlanServiceNode[],
        propertyParams,
      } as Partial<
        InstanceBindingNode<
          FooWithDefaultProperty,
          InstanceBinding<FooWithDefaultProperty>
        >
      > as InstanceBindingNode<
        FooWithDefaultProperty,
        InstanceBinding<FooWithDefaultProperty>
      >;
    }

    describe('when called, and the property has no bindings', () => {
      let nodeFixture: InstanceBindingNode<
        FooWithDefaultProperty,
        InstanceBinding<FooWithDefaultProperty>
      >;

      let result: unknown;

      beforeAll(() => {
        nodeFixture = buildNodeFixtureWithUnboundProperty();

        const resolveNode: (
          params: ResolutionParams,
        ) => Resolved<FooWithDefaultProperty> =
          buildConstructorArgumentsResolverJit(
            nodeFixture,
            FooWithDefaultProperty,
            resolveThree,
          );

        nodeFixture.constructorParams.push(
          ...['value-0', 'value-1'].map(
            (value: string): PlanServiceNode =>
              ({
                resolve: (): string => value,
              }) as Partial<PlanServiceNode> as PlanServiceNode,
          ),
        );

        result = resolveNode(paramsFixture);
      });

      it('should build an instance preserving the default property value', () => {
        expect(result).toBeInstanceOf(FooWithDefaultProperty);
        expect((result as FooWithDefaultProperty).args).toStrictEqual([
          'value-0',
          'value-1',
        ]);
        expect((result as FooWithDefaultProperty).propertyA).toBe(
          'default-property-0',
        );
      });
    });
  });

  describe.each<[string, number, string[], PropertyFixture[]]>([
    [
      'zero constructor arguments and five properties',
      0,
      [],
      [
        { key: 'propertyA', value: 'property-0' },
        { key: 'propertyB', value: 'property-1' },
        { key: 'propertyC', value: 'property-2' },
        { key: 'propertyD', value: 'property-3' },
        { key: 'propertyE', value: 'property-4' },
      ],
    ],
    [
      'two constructor arguments and three properties',
      2,
      ['value-0', 'value-1'],
      [
        { key: 'propertyA', value: 'property-0' },
        { key: 'propertyB', value: 'property-1' },
        { key: 'propertyC', value: 'property-2' },
      ],
    ],
  ])(
    'having %s',
    (
      _description: string,
      paramsCount: number,
      valueFixtures: string[],
      propertyFixtures: PropertyFixture[],
    ) => {
      let paramsFixture: ResolutionParams;

      beforeAll(() => {
        paramsFixture = Symbol() as unknown as ResolutionParams;
      });

      function populatePropertyResolvers(
        nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>,
      ): void {
        for (const propertyFixture of propertyFixtures) {
          nodeFixture.propertyParams.set(propertyFixture.key, {
            bindings: [],
            resolve: (resolveParams: ResolutionParams): string => {
              expect(resolveParams).toBe(paramsFixture);

              return propertyFixture.value;
            },
          } as Partial<PlanServiceNode> as PlanServiceNode);
        }
      }

      describe('when called, and resolveActivations is not provided', () => {
        describe('when called, and node params are populated after the resolveNode is built', () => {
          let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

          let result: unknown;

          beforeAll(() => {
            nodeFixture = buildNodeFixtureForArguments(
              paramsCount,
              propertyFixtures,
            );

            const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
              buildConstructorArgumentsResolverJit(
                nodeFixture,
                Foo,
                buildResolveMany(nodeFixture),
              );

            nodeFixture.constructorParams.push(
              ...valueFixtures.map(
                (value: string): PlanServiceNode =>
                  ({
                    resolve: (): string => value,
                  }) as Partial<PlanServiceNode> as PlanServiceNode,
              ),
            );

            populatePropertyResolvers(nodeFixture);

            result = resolveNode(paramsFixture);
          });

          it('should build an instance with the resolved constructor arguments and properties in order', () => {
            expect(result).toBeInstanceOf(Foo);
            expect((result as Foo).args).toStrictEqual(valueFixtures);

            for (const propertyFixture of propertyFixtures) {
              expect(
                (result as FooWithProperties)[propertyFixture.key],
              ).toStrictEqual(propertyFixture.value);
            }
          });
        });
      });
    },
  );
});
