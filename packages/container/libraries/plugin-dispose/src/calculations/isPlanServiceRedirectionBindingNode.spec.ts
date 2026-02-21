import { beforeAll, describe, expect, it } from 'vitest';

import { type PlanBindingNode } from '@inversifyjs/core';

import { isPlanServiceRedirectionBindingNode } from './isPlanServiceRedirectionBindingNode.js';

describe(isPlanServiceRedirectionBindingNode, () => {
  describe.each<[string, PlanBindingNode, boolean]>([
    [
      'a non PlanServiceRedirectionBindingNode',
      {} as Partial<PlanBindingNode> as PlanBindingNode,
      false,
    ],
    [
      'a PlanServiceRedirectionBindingNode',
      { redirections: [] } as Partial<PlanBindingNode> as PlanBindingNode,
      true,
    ],
  ])(
    'given %s',
    (_: string, node: PlanBindingNode, expectedResult: boolean) => {
      describe('when called', () => {
        let result: boolean;

        beforeAll(() => {
          result = isPlanServiceRedirectionBindingNode(node);
        });

        it('should return expected result', () => {
          expect(result).toBe(expectedResult);
        });
      });
    },
  );
});
