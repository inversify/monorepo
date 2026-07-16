import { beforeAll, describe, expect, it } from 'vitest';

import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';
import { buildOneResolvedValueArgumentResolver } from './buildOneResolvedValueArgumentResolver.js';

class TestFixtures {
  public static get node(): ResolvedValueBindingNode<
    ResolvedValueBinding<string>
  > {
    return {
      binding: {
        factory: (value: unknown): string => `factory:${String(value)}`,
        metadata: {
          arguments: [Symbol()],
        },
      },
      params: [],
    } as unknown as ResolvedValueBindingNode<ResolvedValueBinding<string>>;
  }

  public static get params(): ResolutionParams {
    return Symbol() as unknown as ResolutionParams;
  }
}

describe(buildOneResolvedValueArgumentResolver, () => {
  describe('having a resolved value binding node', () => {
    describe('when called, and node.params is populated after the resolver is built', () => {
      let result: unknown;

      beforeAll(() => {
        const nodeFixture: ResolvedValueBindingNode<
          ResolvedValueBinding<string>
        > = TestFixtures.node;
        const resolveNode: (params: ResolutionParams) => Resolved<string> =
          buildOneResolvedValueArgumentResolver(
            nodeFixture,
            (
              _params: ResolutionParams,
              resolvedValue: Resolved<string>,
            ): Resolved<string> => resolvedValue,
          );

        nodeFixture.params.push({
          resolve: (): string => 'value-0',
        } as Partial<PlanServiceNode> as PlanServiceNode);

        result = resolveNode(TestFixtures.params);
      });

      it('should call the factory with the resolved argument', () => {
        expect(result).toBe('factory:value-0');
      });
    });

    describe('when called, and the argument resolves asynchronously', () => {
      let result: unknown;

      beforeAll(async () => {
        const nodeFixture: ResolvedValueBindingNode<
          ResolvedValueBinding<string>
        > = TestFixtures.node;
        const resolveNode: (params: ResolutionParams) => Resolved<string> =
          buildOneResolvedValueArgumentResolver(
            nodeFixture,
            (
              _params: ResolutionParams,
              resolvedValue: Resolved<string>,
            ): Resolved<string> => resolvedValue,
          );

        nodeFixture.params.push({
          resolve: async (): Promise<string> => 'value-0',
        } as Partial<PlanServiceNode> as PlanServiceNode);

        result = await resolveNode(TestFixtures.params);
      });

      it('should call the factory with the resolved argument', () => {
        expect(result).toBe('factory:value-0');
      });
    });
  });
});
