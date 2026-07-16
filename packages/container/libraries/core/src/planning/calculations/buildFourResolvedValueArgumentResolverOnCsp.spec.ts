import { beforeAll, describe, expect, it } from 'vitest';

import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';
import { buildFourResolvedValueArgumentResolverOnCsp } from './buildFourResolvedValueArgumentResolverOnCsp.js';

class TestFixtures {
  public static get node(): ResolvedValueBindingNode<
    ResolvedValueBinding<string>
  > {
    return {
      binding: {
        factory: (
          value0: unknown,
          value1: unknown,
          value2: unknown,
          value3: unknown,
        ): string =>
          `factory:${String(value0)}:${String(value1)}:${String(value2)}:${String(value3)}`,
        metadata: {
          arguments: [Symbol(), Symbol(), Symbol(), Symbol()],
        },
      },
      params: [],
    } as unknown as ResolvedValueBindingNode<ResolvedValueBinding<string>>;
  }

  public static get params(): ResolutionParams {
    return Symbol() as unknown as ResolutionParams;
  }
}

function buildParamsFixture(
  resolve0: () => unknown,
  resolve1: () => unknown,
  resolve2: () => unknown,
  resolve3: () => unknown,
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
    {
      resolve: resolve3,
    } as Partial<PlanServiceNode> as PlanServiceNode,
  ];
}

describe(buildFourResolvedValueArgumentResolverOnCsp, () => {
  describe('having a resolved value binding node', () => {
    describe('when called, and node.params is populated after the resolver is built', () => {
      let result: unknown;

      beforeAll(() => {
        const nodeFixture: ResolvedValueBindingNode<
          ResolvedValueBinding<string>
        > = TestFixtures.node;
        const resolveNode: (params: ResolutionParams) => Resolved<string> =
          buildFourResolvedValueArgumentResolverOnCsp(
            nodeFixture,
            (
              _params: ResolutionParams,
              resolvedValue: Resolved<string>,
            ): Resolved<string> => resolvedValue,
          );

        nodeFixture.params.push(
          ...buildParamsFixture(
            (): string => 'value-0',
            (): string => 'value-1',
            (): string => 'value-2',
            (): string => 'value-3',
          ),
        );

        result = resolveNode(TestFixtures.params);
      });

      it('should call the factory with the resolved arguments', () => {
        expect(result).toBe('factory:value-0:value-1:value-2:value-3');
      });
    });

    describe.each<
      [string, () => unknown, () => unknown, () => unknown, () => unknown]
    >([
      [
        'all arguments resolve asynchronously',
        async (): Promise<string> => 'value-0',
        async (): Promise<string> => 'value-1',
        async (): Promise<string> => 'value-2',
        async (): Promise<string> => 'value-3',
      ],
      [
        'the first argument resolves asynchronously',
        async (): Promise<string> => 'value-0',
        (): string => 'value-1',
        (): string => 'value-2',
        (): string => 'value-3',
      ],
      [
        'the second argument resolves asynchronously',
        (): string => 'value-0',
        async (): Promise<string> => 'value-1',
        (): string => 'value-2',
        (): string => 'value-3',
      ],
      [
        'the third argument resolves asynchronously',
        (): string => 'value-0',
        (): string => 'value-1',
        async (): Promise<string> => 'value-2',
        (): string => 'value-3',
      ],
      [
        'the fourth argument resolves asynchronously',
        (): string => 'value-0',
        (): string => 'value-1',
        (): string => 'value-2',
        async (): Promise<string> => 'value-3',
      ],
    ])(
      'when called, and %s',
      (
        _: string,
        resolve0: () => unknown,
        resolve1: () => unknown,
        resolve2: () => unknown,
        resolve3: () => unknown,
      ) => {
        let result: unknown;

        beforeAll(async () => {
          const nodeFixture: ResolvedValueBindingNode<
            ResolvedValueBinding<string>
          > = TestFixtures.node;
          const resolveNode: (params: ResolutionParams) => Resolved<string> =
            buildFourResolvedValueArgumentResolverOnCsp(
              nodeFixture,
              (
                _params: ResolutionParams,
                resolvedValue: Resolved<string>,
              ): Resolved<string> => resolvedValue,
            );

          nodeFixture.params.push(
            ...buildParamsFixture(resolve0, resolve1, resolve2, resolve3),
          );

          result = await resolveNode(TestFixtures.params);
        });

        it('should call the factory with the resolved arguments', () => {
          expect(result).toBe('factory:value-0:value-1:value-2:value-3');
        });
      },
    );
  });
});
