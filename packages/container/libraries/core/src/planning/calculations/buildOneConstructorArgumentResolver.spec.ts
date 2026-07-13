import { beforeAll, describe, expect, it } from 'vitest';

import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type Writable } from '../../common/models/Writable.js';
import { type ClassElementMetadata } from '../../metadata/models/ClassElementMetadata.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { buildOneConstructorArgumentResolver } from './buildOneConstructorArgumentResolver.js';

class Foo {
  public readonly args: unknown[];

  constructor(...args: unknown[]) {
    this.args = args;
  }
}

function buildNodeFixture(): InstanceBindingNode<Foo, InstanceBinding<Foo>> {
  return {
    classMetadata: {
      constructorArguments: new Array<ClassElementMetadata>(1).fill(
        Symbol() as unknown as ClassElementMetadata,
      ),
      lifecycle: {
        postConstructMethodNames: new Set(),
        preDestroyMethodNames: new Set(),
      },
      properties: new Map<string | symbol, unknown>(),
      scope: undefined,
    },
    constructorParams: [] as PlanServiceNode[],
  } as Partial<
    InstanceBindingNode<Foo, InstanceBinding<Foo>>
  > as InstanceBindingNode<Foo, InstanceBinding<Foo>>;
}

describe(buildOneConstructorArgumentResolver, () => {
  let paramsFixture: ResolutionParams;

  beforeAll(() => {
    paramsFixture = Symbol() as unknown as ResolutionParams;
  });

  describe('when called, and resolveActivations is not provided', () => {
    describe('when called, and node.constructorParams is populated after the resolveNode is built', () => {
      let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

      let result: unknown;

      beforeAll(() => {
        nodeFixture = buildNodeFixture();

        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildOneConstructorArgumentResolver(nodeFixture, Foo);

        nodeFixture.constructorParams.push({
          resolve: (): string => 'value-0',
        } as Partial<PlanServiceNode> as PlanServiceNode);

        result = resolveNode(paramsFixture);
      });

      it('should build an instance with the resolved constructor argument', () => {
        expect(result).toBeInstanceOf(Foo);
        expect((result as Foo).args).toStrictEqual(['value-0']);
      });
    });

    describe('when called, and the constructor argument resolves asynchronously', () => {
      let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

      let result: unknown;

      beforeAll(async () => {
        nodeFixture = buildNodeFixture();

        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildOneConstructorArgumentResolver(nodeFixture, Foo);

        (
          nodeFixture as Writable<
            InstanceBindingNode<Foo, InstanceBinding<Foo>>
          >
        ).constructorParams = [
          {
            resolve: async (): Promise<string> => 'value-0',
          } as Partial<PlanServiceNode> as PlanServiceNode,
        ];

        result = await resolveNode(paramsFixture);
      });

      it('should build an instance with the resolved constructor argument', () => {
        expect(result).toBeInstanceOf(Foo);
        expect((result as Foo).args).toStrictEqual(['value-0']);
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
        nodeFixture = buildNodeFixture();

        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildOneConstructorArgumentResolver(
            nodeFixture,
            Foo,
            resolveActivations,
          );

        nodeFixture.constructorParams.push({
          resolve: (): string => 'value-0',
        } as Partial<PlanServiceNode> as PlanServiceNode);

        result = resolveNode(paramsFixture);
      });

      it('should build an instance with the resolved constructor argument', () => {
        expect(result).toBeInstanceOf(Foo);
        expect((result as Foo).args).toStrictEqual(['value-0']);
      });
    });

    describe('when called, and the constructor argument resolves asynchronously', () => {
      let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

      let result: unknown;

      beforeAll(async () => {
        nodeFixture = buildNodeFixture();

        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildOneConstructorArgumentResolver(
            nodeFixture,
            Foo,
            resolveActivations,
          );

        (
          nodeFixture as Writable<
            InstanceBindingNode<Foo, InstanceBinding<Foo>>
          >
        ).constructorParams = [
          {
            resolve: async (): Promise<string> => 'value-0',
          } as Partial<PlanServiceNode> as PlanServiceNode,
        ];

        result = await resolveNode(paramsFixture);
      });

      it('should build an instance with the resolved constructor argument', () => {
        expect(result).toBeInstanceOf(Foo);
        expect((result as Foo).args).toStrictEqual(['value-0']);
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
          buildOneConstructorArgumentResolver(
            nodeFixture,
            Foo,
            resolveActivations,
          );

        nodeFixture.constructorParams.push({
          resolve: (): string => 'value-0',
        } as Partial<PlanServiceNode> as PlanServiceNode);

        result = await resolveNode(paramsFixture);
      });

      it('should return the resolved activation result', () => {
        expect(result).toBe(expectedResult);
      });
    });
  });
});
