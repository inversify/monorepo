import { beforeAll, describe, expect, it } from 'vitest';

import { ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding';
import { ResolvedValueBindingNode } from '../../planning/models/ResolvedValueBindingNode';
import { getResolvedValueNodeBinding } from './getResolvedValueNodeBinding';

describe(getResolvedValueNodeBinding.name, () => {
  let nodeFixture: ResolvedValueBindingNode<ResolvedValueBinding<unknown>>;

  beforeAll(() => {
    nodeFixture = {
      binding: Symbol() as unknown as ResolvedValueBinding<unknown>,
    } as Partial<
      ResolvedValueBindingNode<ResolvedValueBinding<unknown>>
    > as ResolvedValueBindingNode<ResolvedValueBinding<unknown>>;
  });

  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = getResolvedValueNodeBinding(nodeFixture);
    });

    it('should return expected value', () => {
      expect(result).toBe(nodeFixture.binding);
    });
  });
});
