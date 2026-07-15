import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('../../resolution/actions/setInstanceProperties.js'));

import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type Writable } from '../../common/models/Writable.js';
import { type ClassElementMetadata } from '../../metadata/models/ClassElementMetadata.js';
import { setInstanceProperties } from '../../resolution/actions/setInstanceProperties.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { buildThreeConstructorArgumentResolverOnCsp } from './buildThreeConstructorArgumentResolverOnCsp.js';

class Foo {
  public readonly args: unknown[];

  constructor(...args: unknown[]) {
    this.args = args;
  }
}

const expectedArgs: string[] = ['value-0', 'value-1', 'value-2'];

function buildNodeFixture(
  propertiesSize: number = 0,
): InstanceBindingNode<Foo, InstanceBinding<Foo>> {
  const properties: Map<string | symbol, ClassElementMetadata> = new Map();

  for (let index: number = 0; index < propertiesSize; ++index) {
    properties.set(
      `property-${index.toString()}`,
      Symbol() as unknown as ClassElementMetadata,
    );
  }

  return {
    binding: {
      implementationType: Foo,
    } as Partial<InstanceBinding<Foo>> as InstanceBinding<Foo>,
    classMetadata: {
      constructorArguments: new Array<ClassElementMetadata>(3).fill(
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
    propertyParams: new Map(),
  } as Partial<
    InstanceBindingNode<Foo, InstanceBinding<Foo>>
  > as InstanceBindingNode<Foo, InstanceBinding<Foo>>;
}

function buildConstructorParamsFixture(
  resolve0: () => unknown,
  resolve1: () => unknown,
  resolve2: () => unknown,
): PlanServiceNode[] {
  return [
    {
      resolve: resolve0,
    } as Partial<PlanServiceNode> as PlanServiceNode,
    {
      resolve: resolve1,
    } as Partial<PlanServiceNode> as PlanServiceNode,
    {
      resolve: resolve2,
    } as Partial<PlanServiceNode> as PlanServiceNode,
  ];
}

describe(buildThreeConstructorArgumentResolverOnCsp, () => {
  let paramsFixture: ResolutionParams;

  beforeAll(() => {
    paramsFixture = Symbol() as unknown as ResolutionParams;
  });

  describe('having node.classMetadata.properties empty and resolveActivations not provided', () => {
    let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

    beforeAll(() => {
      nodeFixture = buildNodeFixture();
    });

    describe('when called, and node.constructorParams is populated after the resolveNode is built', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildThreeConstructorArgumentResolverOnCsp(nodeFixture);

        (
          nodeFixture as Writable<
            InstanceBindingNode<Foo, InstanceBinding<Foo>>
          >
        ).constructorParams = buildConstructorParamsFixture(
          (): string => 'value-0',
          (): string => 'value-1',
          (): string => 'value-2',
        );

        result = resolveNode(paramsFixture);
      });

      it('should build an instance with the resolved constructor arguments', () => {
        expect(result).toBeInstanceOf(Foo);
        expect((result as Foo).args).toStrictEqual(expectedArgs);
      });

      it('should not call setInstanceProperties()', () => {
        expect(setInstanceProperties).not.toHaveBeenCalled();
      });
    });

    describe.each<[string, () => unknown, () => unknown, () => unknown]>([
      [
        'all constructor arguments resolve asynchronously',
        async (): Promise<string> => 'value-0',
        async (): Promise<string> => 'value-1',
        async (): Promise<string> => 'value-2',
      ],
      [
        'the first constructor argument resolves asynchronously',
        async (): Promise<string> => 'value-0',
        (): string => 'value-1',
        (): string => 'value-2',
      ],
      [
        'the second constructor argument resolves asynchronously',
        (): string => 'value-0',
        async (): Promise<string> => 'value-1',
        (): string => 'value-2',
      ],
      [
        'the third constructor argument resolves asynchronously',
        (): string => 'value-0',
        (): string => 'value-1',
        async (): Promise<string> => 'value-2',
      ],
    ])(
      'when called, and %s',
      (
        _: string,
        resolve0: () => unknown,
        resolve1: () => unknown,
        resolve2: () => unknown,
      ) => {
        let result: unknown;

        beforeAll(async () => {
          const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
            buildThreeConstructorArgumentResolverOnCsp(nodeFixture);

          (
            nodeFixture as Writable<
              InstanceBindingNode<Foo, InstanceBinding<Foo>>
            >
          ).constructorParams = buildConstructorParamsFixture(
            resolve0,
            resolve1,
            resolve2,
          );

          result = await resolveNode(paramsFixture);
        });

        it('should build an instance with the resolved constructor arguments', () => {
          expect(result).toBeInstanceOf(Foo);
          expect((result as Foo).args).toStrictEqual(expectedArgs);
        });
      },
    );
  });

  describe('having node.classMetadata.properties empty and resolveActivations provided', () => {
    let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;
    let resolveActivations: (
      params: ResolutionParams,
      instance: Resolved<Foo>,
    ) => Resolved<Foo>;

    beforeAll(() => {
      nodeFixture = buildNodeFixture();

      resolveActivations = (
        _params: ResolutionParams,
        instance: Resolved<Foo>,
      ): Resolved<Foo> => instance;
    });

    describe('when called, and node.constructorParams is populated after the resolveNode is built', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildThreeConstructorArgumentResolverOnCsp(
            nodeFixture,
            resolveActivations,
          );

        (
          nodeFixture as Writable<
            InstanceBindingNode<Foo, InstanceBinding<Foo>>
          >
        ).constructorParams = buildConstructorParamsFixture(
          (): string => 'value-0',
          (): string => 'value-1',
          (): string => 'value-2',
        );

        result = resolveNode(paramsFixture);
      });

      it('should build an instance with the resolved constructor arguments', () => {
        expect(result).toBeInstanceOf(Foo);
        expect((result as Foo).args).toStrictEqual(expectedArgs);
      });
    });

    describe('when called, and all constructor arguments resolve asynchronously', () => {
      let result: unknown;

      beforeAll(async () => {
        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildThreeConstructorArgumentResolverOnCsp(
            nodeFixture,
            resolveActivations,
          );

        (
          nodeFixture as Writable<
            InstanceBindingNode<Foo, InstanceBinding<Foo>>
          >
        ).constructorParams = buildConstructorParamsFixture(
          async (): Promise<string> => 'value-0',
          async (): Promise<string> => 'value-1',
          async (): Promise<string> => 'value-2',
        );

        result = await resolveNode(paramsFixture);
      });

      it('should build an instance with the resolved constructor arguments', () => {
        expect(result).toBeInstanceOf(Foo);
        expect((result as Foo).args).toStrictEqual(expectedArgs);
      });
    });

    describe('when called, and resolveActivations returns a promise', () => {
      let expectedResult: unknown;
      let result: unknown;

      beforeAll(async () => {
        resolveActivations = (
          _params: ResolutionParams,
          instance: Resolved<Foo>,
        ): Resolved<Foo> => {
          expectedResult = instance;

          return Promise.resolve(instance);
        };

        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildThreeConstructorArgumentResolverOnCsp(
            nodeFixture,
            resolveActivations,
          );

        (
          nodeFixture as Writable<
            InstanceBindingNode<Foo, InstanceBinding<Foo>>
          >
        ).constructorParams = buildConstructorParamsFixture(
          (): string => 'value-0',
          (): string => 'value-1',
          (): string => 'value-2',
        );

        result = await resolveNode(paramsFixture);
      });

      it('should return the resolved activation result', () => {
        expect(result).toBe(expectedResult);
      });
    });
  });

  describe('having node.classMetadata.properties not empty and resolveActivations not provided', () => {
    let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

    beforeAll(() => {
      nodeFixture = buildNodeFixture(1);
    });

    describe('when called, and setInstanceProperties() returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        vitest.mocked(setInstanceProperties).mockReturnValueOnce(undefined);

        (
          nodeFixture as Writable<
            InstanceBindingNode<Foo, InstanceBinding<Foo>>
          >
        ).constructorParams = buildConstructorParamsFixture(
          (): string => 'value-0',
          (): string => 'value-1',
          (): string => 'value-2',
        );

        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildThreeConstructorArgumentResolverOnCsp(nodeFixture);

        result = resolveNode(paramsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should build an instance with the resolved constructor arguments', () => {
        expect(result).toBeInstanceOf(Foo);
        expect((result as Foo).args).toStrictEqual(expectedArgs);
      });

      it('should call setInstanceProperties()', () => {
        expect(setInstanceProperties).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
          expect.any(Foo),
          nodeFixture,
        );
      });
    });

    describe('when called, and setInstanceProperties() returns a promise', () => {
      let result: unknown;

      beforeAll(() => {
        vitest.mocked(setInstanceProperties).mockResolvedValueOnce(undefined);

        (
          nodeFixture as Writable<
            InstanceBindingNode<Foo, InstanceBinding<Foo>>
          >
        ).constructorParams = buildConstructorParamsFixture(
          (): string => 'value-0',
          (): string => 'value-1',
          (): string => 'value-2',
        );

        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildThreeConstructorArgumentResolverOnCsp(nodeFixture);

        result = resolveNode(paramsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should build an instance with the resolved constructor arguments', () => {
        expect(result).toStrictEqual(Promise.resolve(expect.any(Foo)));
      });

      it('should call setInstanceProperties()', () => {
        expect(setInstanceProperties).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
          expect.any(Foo),
          nodeFixture,
        );
      });
    });

    describe('when called, and all constructor arguments resolve asynchronously', () => {
      let result: unknown;

      beforeAll(async () => {
        vitest.mocked(setInstanceProperties).mockReturnValueOnce(undefined);

        (
          nodeFixture as Writable<
            InstanceBindingNode<Foo, InstanceBinding<Foo>>
          >
        ).constructorParams = buildConstructorParamsFixture(
          async (): Promise<string> => 'value-0',
          async (): Promise<string> => 'value-1',
          async (): Promise<string> => 'value-2',
        );

        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildThreeConstructorArgumentResolverOnCsp(nodeFixture);

        result = await resolveNode(paramsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should build an instance with the resolved constructor arguments', () => {
        expect(result).toBeInstanceOf(Foo);
        expect((result as Foo).args).toStrictEqual(expectedArgs);
      });

      it('should call setInstanceProperties()', () => {
        expect(setInstanceProperties).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
          expect.any(Foo),
          nodeFixture,
        );
      });
    });
  });

  describe('having node.classMetadata.properties not empty and resolveActivations provided', () => {
    let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

    beforeAll(() => {
      nodeFixture = buildNodeFixture(1);
    });

    describe('when called, and setInstanceProperties() returns undefined', () => {
      let expectedResult: unknown;
      let result: unknown;

      beforeAll(() => {
        vitest.mocked(setInstanceProperties).mockReturnValueOnce(undefined);

        (
          nodeFixture as Writable<
            InstanceBindingNode<Foo, InstanceBinding<Foo>>
          >
        ).constructorParams = buildConstructorParamsFixture(
          (): string => 'value-0',
          (): string => 'value-1',
          (): string => 'value-2',
        );

        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildThreeConstructorArgumentResolverOnCsp(
            nodeFixture,
            (
              _params: ResolutionParams,
              instance: Resolved<Foo>,
            ): Resolved<Foo> => {
              expectedResult = instance;

              return instance;
            },
          );

        result = resolveNode(paramsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return the activation result', () => {
        expect(result).toBe(expectedResult);
      });

      it('should call setInstanceProperties()', () => {
        expect(setInstanceProperties).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
          expect.any(Foo),
          nodeFixture,
        );
      });
    });

    describe('when called, and setInstanceProperties() returns a promise', () => {
      let expectedResult: unknown;
      let result: unknown;

      beforeAll(async () => {
        vitest.mocked(setInstanceProperties).mockResolvedValueOnce(undefined);

        (
          nodeFixture as Writable<
            InstanceBindingNode<Foo, InstanceBinding<Foo>>
          >
        ).constructorParams = buildConstructorParamsFixture(
          (): string => 'value-0',
          (): string => 'value-1',
          (): string => 'value-2',
        );

        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildThreeConstructorArgumentResolverOnCsp(
            nodeFixture,
            (
              _params: ResolutionParams,
              instance: Resolved<Foo>,
            ): Resolved<Foo> => {
              expectedResult = instance;

              return Promise.resolve(instance);
            },
          );

        result = await resolveNode(paramsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return the resolved activation result', () => {
        expect(result).toBe(expectedResult);
      });

      it('should call setInstanceProperties()', () => {
        expect(setInstanceProperties).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
          expect.any(Foo),
          nodeFixture,
        );
      });
    });
  });
});
