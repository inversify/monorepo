import { beforeAll, describe, expect, it } from 'vitest';

import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type Writable } from '../../common/models/Writable.js';
import { type ClassElementMetadata } from '../../metadata/models/ClassElementMetadata.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { buildOnePropertyArgumentResolverJit } from './buildOnePropertyArgumentResolverJit.js';

const propertyKeyFixture: string = 'propertyA';

class Foo {
  public readonly args: unknown[];

  constructor(...args: unknown[]) {
    this.args = args;
  }
}

type FooWithProperties = Foo & Record<string | symbol, unknown>;

function buildNodeFixture(): InstanceBindingNode<Foo, InstanceBinding<Foo>> {
  return {
    classMetadata: {
      constructorArguments: [],
      lifecycle: {
        postConstructMethodNames: new Set(),
        preDestroyMethodNames: new Set(),
      },
      properties: new Map<string | symbol, ClassElementMetadata>([
        [propertyKeyFixture, Symbol() as unknown as ClassElementMetadata],
      ]),
      scope: undefined,
    },
    constructorParams: [],
    propertyParams: new Map<string | symbol, PlanServiceNode>(),
  } as Partial<
    InstanceBindingNode<Foo, InstanceBinding<Foo>>
  > as InstanceBindingNode<Foo, InstanceBinding<Foo>>;
}

describe(buildOnePropertyArgumentResolverJit, () => {
  let paramsFixture: ResolutionParams;

  beforeAll(() => {
    paramsFixture = Symbol() as unknown as ResolutionParams;
  });

  describe('when called, and resolveActivations is not provided', () => {
    describe('when called, and node.propertyParams is populated after the resolveNode is built', () => {
      let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

      let result: unknown;

      beforeAll(() => {
        nodeFixture = buildNodeFixture();

        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildOnePropertyArgumentResolverJit(nodeFixture, Foo);

        nodeFixture.propertyParams.set(propertyKeyFixture, {
          bindings: [],
          resolve: (): string => 'property-0',
        } as Partial<PlanServiceNode> as PlanServiceNode);

        result = resolveNode(paramsFixture);
      });

      it('should build an instance with the resolved property', () => {
        expect(result).toBeInstanceOf(Foo);
        expect((result as Foo).args).toStrictEqual([]);
        expect((result as FooWithProperties)[propertyKeyFixture]).toBe(
          'property-0',
        );
      });
    });

    describe('when called, and the property resolves asynchronously', () => {
      let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

      let result: unknown;

      beforeAll(async () => {
        nodeFixture = buildNodeFixture();

        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildOnePropertyArgumentResolverJit(nodeFixture, Foo);

        (
          nodeFixture as Writable<
            InstanceBindingNode<Foo, InstanceBinding<Foo>>
          >
        ).propertyParams = new Map<string | symbol, PlanServiceNode>([
          [
            propertyKeyFixture,
            {
              bindings: [],
              resolve: async (): Promise<string> => 'property-0',
            } as Partial<PlanServiceNode> as PlanServiceNode,
          ],
        ]);

        result = await resolveNode(paramsFixture);
      });

      it('should build an instance with the resolved property', () => {
        expect(result).toBeInstanceOf(Foo);
        expect((result as Foo).args).toStrictEqual([]);
        expect((result as FooWithProperties)[propertyKeyFixture]).toBe(
          'property-0',
        );
      });
    });

    describe('when called, and the property has no bindings', () => {
      let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

      let result: unknown;

      beforeAll(() => {
        nodeFixture = buildNodeFixture();

        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildOnePropertyArgumentResolverJit(nodeFixture, Foo);

        nodeFixture.propertyParams.set(propertyKeyFixture, {
          bindings: undefined,
          resolve: (): string => {
            throw new Error(
              'resolve should not be called when the property has no bindings',
            );
          },
        } as Partial<PlanServiceNode> as PlanServiceNode);

        result = resolveNode(paramsFixture);
      });

      it('should build an instance without setting the property', () => {
        expect(result).toBeInstanceOf(Foo);
        expect((result as Foo).args).toStrictEqual([]);
        expect(
          (result as FooWithProperties)[propertyKeyFixture],
        ).toBeUndefined();
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

    describe('when called, and node.propertyParams is populated after the resolveNode is built', () => {
      let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

      let result: unknown;

      beforeAll(() => {
        nodeFixture = buildNodeFixture();

        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildOnePropertyArgumentResolverJit(
            nodeFixture,
            Foo,
            resolveActivations,
          );

        nodeFixture.propertyParams.set(propertyKeyFixture, {
          bindings: [],
          resolve: (): string => 'property-0',
        } as Partial<PlanServiceNode> as PlanServiceNode);

        result = resolveNode(paramsFixture);
      });

      it('should build an instance with the resolved property', () => {
        expect(result).toBeInstanceOf(Foo);
        expect((result as Foo).args).toStrictEqual([]);
        expect((result as FooWithProperties)[propertyKeyFixture]).toBe(
          'property-0',
        );
      });
    });

    describe('when called, and the property resolves asynchronously', () => {
      let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

      let result: unknown;

      beforeAll(async () => {
        nodeFixture = buildNodeFixture();

        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildOnePropertyArgumentResolverJit(
            nodeFixture,
            Foo,
            resolveActivations,
          );

        (
          nodeFixture as Writable<
            InstanceBindingNode<Foo, InstanceBinding<Foo>>
          >
        ).propertyParams = new Map<string | symbol, PlanServiceNode>([
          [
            propertyKeyFixture,
            {
              bindings: [],
              resolve: async (): Promise<string> => 'property-0',
            } as Partial<PlanServiceNode> as PlanServiceNode,
          ],
        ]);

        result = await resolveNode(paramsFixture);
      });

      it('should build an instance with the resolved property', () => {
        expect(result).toBeInstanceOf(Foo);
        expect((result as Foo).args).toStrictEqual([]);
        expect((result as FooWithProperties)[propertyKeyFixture]).toBe(
          'property-0',
        );
      });
    });

    describe('when called, and the property has no bindings', () => {
      let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

      let result: unknown;

      beforeAll(() => {
        nodeFixture = buildNodeFixture();

        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildOnePropertyArgumentResolverJit(
            nodeFixture,
            Foo,
            resolveActivations,
          );

        nodeFixture.propertyParams.set(propertyKeyFixture, {
          bindings: undefined,
          resolve: (): string => {
            throw new Error(
              'resolve should not be called when the property has no bindings',
            );
          },
        } as Partial<PlanServiceNode> as PlanServiceNode);

        result = resolveNode(paramsFixture);
      });

      it('should build an instance without setting the property', () => {
        expect(result).toBeInstanceOf(Foo);
        expect((result as Foo).args).toStrictEqual([]);
        expect(
          (result as FooWithProperties)[propertyKeyFixture],
        ).toBeUndefined();
      });
    });

    describe('when called, and resolveActivations returns a promise', () => {
      let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

      let expectedResult: unknown;
      let result: unknown;

      beforeAll(async () => {
        nodeFixture = buildNodeFixture();

        resolveActivations = (
          _params: ResolutionParams,
          instance: Resolved<Foo>,
        ): Resolved<Foo> => {
          expectedResult = instance;

          return Promise.resolve(instance);
        };

        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildOnePropertyArgumentResolverJit(
            nodeFixture,
            Foo,
            resolveActivations,
          );

        nodeFixture.propertyParams.set(propertyKeyFixture, {
          bindings: [],
          resolve: (): string => 'property-0',
        } as Partial<PlanServiceNode> as PlanServiceNode);

        result = await resolveNode(paramsFixture);
      });

      it('should return the resolved activation result', () => {
        expect(result).toBe(expectedResult);
      });
    });
  });
});
