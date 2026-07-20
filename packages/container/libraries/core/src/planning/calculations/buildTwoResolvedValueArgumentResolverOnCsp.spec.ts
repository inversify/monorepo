import { beforeAll, describe, expect, it } from 'vitest';

import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';
import { buildTwoResolvedValueArgumentResolverOnCsp } from './buildTwoResolvedValueArgumentResolverOnCsp.js';

class TestFixtures {
  public static get node(): ResolvedValueBindingNode<
    ResolvedValueBinding<string>
  > {
    return {
      binding: {
        factory: (value0: unknown, value1: unknown): string =>
          `factory:${String(value0)}:${String(value1)}`,
        metadata: {
          arguments: [Symbol(), Symbol()],
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
): PlanServiceNode[] {
  return [
    {
      resolve: resolve0,
    } as Partial<PlanServiceNode> as PlanServiceNode,
    {
      resolve: resolve1,
    } as Partial<PlanServiceNode> as PlanServiceNode,
  ];
}

describe(buildTwoResolvedValueArgumentResolverOnCsp, () => {
  describe('when called, and resolveActivations is not provided', () => {
    describe('when called, and node.params is populated after the resolver is built', () => {
      let result: unknown;

      beforeAll(() => {
        const nodeFixture: ResolvedValueBindingNode<
          ResolvedValueBinding<string>
        > = TestFixtures.node;
        const resolveNode: (params: ResolutionParams) => Resolved<string> =
          buildTwoResolvedValueArgumentResolverOnCsp(nodeFixture);

        nodeFixture.params.push(
          ...buildParamsFixture(
            (): string => 'value-0',
            (): string => 'value-1',
          ),
        );

        result = resolveNode(TestFixtures.params);
      });

      it('should call the factory with the resolved arguments', () => {
        expect(result).toBe('factory:value-0:value-1');
      });
    });
  });

  describe('when called, and resolveActivations is provided', () => {
    describe('when called, and node.params is populated after the resolver is built', () => {
      let result: unknown;

      beforeAll(() => {
        const nodeFixture: ResolvedValueBindingNode<
          ResolvedValueBinding<string>
        > = TestFixtures.node;
        const resolveNode: (params: ResolutionParams) => Resolved<string> =
          buildTwoResolvedValueArgumentResolverOnCsp(
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
          ),
        );

        result = resolveNode(TestFixtures.params);
      });

      it('should call the factory with the resolved arguments', () => {
        expect(result).toBe('factory:value-0:value-1');
      });
    });

    describe.each<[string, () => unknown, () => unknown]>([
      [
        'both arguments resolve asynchronously',
        async (): Promise<string> => 'value-0',
        async (): Promise<string> => 'value-1',
      ],
      [
        'the first argument resolves asynchronously',
        async (): Promise<string> => 'value-0',
        (): string => 'value-1',
      ],
      [
        'the second argument resolves asynchronously',
        (): string => 'value-0',
        async (): Promise<string> => 'value-1',
      ],
    ])(
      'when called, and %s',
      (_: string, resolve0: () => unknown, resolve1: () => unknown) => {
        let result: unknown;

        beforeAll(async () => {
          const nodeFixture: ResolvedValueBindingNode<
            ResolvedValueBinding<string>
          > = TestFixtures.node;
          const resolveNode: (params: ResolutionParams) => Resolved<string> =
            buildTwoResolvedValueArgumentResolverOnCsp(
              nodeFixture,
              (
                _params: ResolutionParams,
                resolvedValue: Resolved<string>,
              ): Resolved<string> => resolvedValue,
            );

          nodeFixture.params.push(...buildParamsFixture(resolve0, resolve1));

          result = await resolveNode(TestFixtures.params);
        });

        it('should call the factory with the resolved arguments', () => {
          expect(result).toBe('factory:value-0:value-1');
        });
      },
    );
  });
});
