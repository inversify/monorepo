import { beforeAll, describe, expect, it } from 'vitest';

import { InstanceBinding } from '../../binding/models/InstanceBinding';
import { InstanceBindingNode } from '../../planning/models/InstanceBindingNode';
import { getInstanceNodeBinding } from './getInstanceNodeBinding';

describe(getInstanceNodeBinding.name, () => {
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
