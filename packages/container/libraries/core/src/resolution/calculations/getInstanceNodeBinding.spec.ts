import { beforeAll, describe, expect, it } from 'vitest';

import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type InstanceBindingNode } from '../../planning/models/InstanceBindingNode.js';
import { getInstanceNodeBinding } from './getInstanceNodeBinding.js';

describe(getInstanceNodeBinding, () => {
  let nodeFixture: InstanceBindingNode<InstanceBinding<unknown>>;

  beforeAll(() => {
    nodeFixture = {
      binding: Symbol() as unknown as InstanceBinding<unknown>,
    } as Partial<
      InstanceBindingNode<InstanceBinding<unknown>>
    > as InstanceBindingNode<InstanceBinding<unknown>>;
  });

  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = getInstanceNodeBinding(nodeFixture);
    });

    it('should return expected value', () => {
      expect(result).toBe(nodeFixture.binding);
    });
  });
});
