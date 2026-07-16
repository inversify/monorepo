import { beforeAll, describe, expect, it } from 'vitest';

import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';
import { buildResolvedValueArgumentsResolverOnCsp } from './buildResolvedValueArgumentsResolverOnCsp.js';
import { resolveFour } from './resolveFour.js';
import { resolveThree } from './resolveThree.js';
import { resolveTwo } from './resolveTwo.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResolveAsyncValues = (...args: any[]) => any;

class TestFixtures {
  public static get params(): ResolutionParams {
    return Symbol() as unknown as ResolutionParams;
  }

  public static node(
    argumentsCount: number,
  ): ResolvedValueBindingNode<ResolvedValueBinding<string[]>> {
    return {
      binding: {
        factory: (...values: unknown[]): string[] => values as string[],
        metadata: {
          arguments: new Array<unknown>(argumentsCount).fill(Symbol()),
        },
      },
      params: [],
    } as unknown as ResolvedValueBindingNode<ResolvedValueBinding<string[]>>;
  }
}

describe(buildResolvedValueArgumentsResolverOnCsp, () => {
  describe.each<[string, ResolveAsyncValues, string[]]>([
    ['two', resolveTwo, ['value-0', 'value-1']],
    ['three', resolveThree, ['value-0', 'value-1', 'value-2']],
    ['four', resolveFour, ['value-0', 'value-1', 'value-2', 'value-3']],
  ])(
    'having %s resolved value arguments',
    (
      _description: string,
      resolveAsyncValues: ResolveAsyncValues,
      valueFixtures: string[],
    ) => {
      describe('when called, and node.params is populated after the resolver is built', () => {
        let result: unknown;

        beforeAll(() => {
          const nodeFixture: ResolvedValueBindingNode<
            ResolvedValueBinding<string[]>
          > = TestFixtures.node(valueFixtures.length);
          const resolveNode: (params: ResolutionParams) => Resolved<string[]> =
            buildResolvedValueArgumentsResolverOnCsp(
              nodeFixture,
              (
                _params: ResolutionParams,
                resolvedValue: Resolved<string[]>,
              ): Resolved<string[]> => resolvedValue,
              resolveAsyncValues,
            );

          nodeFixture.params.push(
            ...valueFixtures.map(
              (value: string): PlanServiceNode =>
                ({
                  resolve: (): string => value,
                }) as Partial<PlanServiceNode> as PlanServiceNode,
            ),
          );

          result = resolveNode(TestFixtures.params);
        });

        it('should call the factory with the resolved arguments in order', () => {
          expect(result).toStrictEqual(valueFixtures);
        });
      });

      describe('when called, and the arguments resolve asynchronously', () => {
        let result: unknown;

        beforeAll(async () => {
          const nodeFixture: ResolvedValueBindingNode<
            ResolvedValueBinding<string[]>
          > = TestFixtures.node(valueFixtures.length);
          const resolveNode: (params: ResolutionParams) => Resolved<string[]> =
            buildResolvedValueArgumentsResolverOnCsp(
              nodeFixture,
              (
                _params: ResolutionParams,
                resolvedValue: Resolved<string[]>,
              ): Resolved<string[]> => resolvedValue,
              resolveAsyncValues,
            );

          nodeFixture.params.push(
            ...valueFixtures.map(
              (value: string): PlanServiceNode =>
                ({
                  resolve: async (): Promise<string> => value,
                }) as Partial<PlanServiceNode> as PlanServiceNode,
            ),
          );

          result = await resolveNode(TestFixtures.params);
        });

        it('should call the factory with the resolved arguments in order', () => {
          expect(result).toStrictEqual(valueFixtures);
        });
      });
    },
  );
});
