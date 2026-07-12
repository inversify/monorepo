import { beforeAll, describe, expect, it } from 'vitest';

import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type ClassElementMetadata } from '../../metadata/models/ClassElementMetadata.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import {
  type Resolved,
  type SyncResolved,
} from '../../resolution/models/Resolved.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { buildConstructorArgumentsResolver } from './buildConstructorArgumentsResolver.js';
import { resolveFour } from './resolveFour.js';
import { resolveThree } from './resolveThree.js';
import { resolveTwo } from './resolveTwo.js';

class Foo {
  public readonly args: unknown[];

  constructor(...args: unknown[]) {
    this.args = args;
  }
}

function buildNodeFixtureForArguments(
  length: number,
): InstanceBindingNode<Foo, InstanceBinding<Foo>> {
  return {
    classMetadata: {
      constructorArguments: new Array<ClassElementMetadata>(length).fill(
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResolveAsyncValues = (...args: any[]) => any;

describe(buildConstructorArgumentsResolver, () => {
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
      let resolveActivations: (
        params: ResolutionParams,
        instance: SyncResolved<Foo>,
      ) => Resolved<Foo>;

      beforeAll(() => {
        paramsFixture = Symbol() as unknown as ResolutionParams;
        resolveActivations = (
          _params: ResolutionParams,
          instance: SyncResolved<Foo>,
        ): Resolved<Foo> => instance;
      });

      describe('when called, and node.constructorParams is populated after the resolveNode is built', () => {
        let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

        let result: unknown;

        beforeAll(() => {
          nodeFixture = buildNodeFixtureForArguments(paramsCount);

          const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
            buildConstructorArgumentsResolver(
              nodeFixture,
              Foo,
              resolveActivations,
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
            buildConstructorArgumentsResolver(
              nodeFixture,
              Foo,
              resolveActivations,
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
    },
  );
});
