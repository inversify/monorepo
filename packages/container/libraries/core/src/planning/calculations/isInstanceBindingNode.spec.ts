import { beforeAll, describe, expect, it } from 'vitest';

import { bindingTypeValues } from '../../binding/models/BindingType';
import { InstanceBindingNode } from '../models/InstanceBindingNode';
import { PlanServiceNodeParent } from '../models/PlanServiceNodeParent';
import { isInstanceBindingNode } from './isInstanceBindingNode';

describe(isInstanceBindingNode.name, () => {
  let node: PlanServiceNodeParent;

  describe('having an InstanceBindingNode', () => {
    beforeAll(() => {
      node = {
        binding: {
          type: bindingTypeValues.Instance,
        },
      } as InstanceBindingNode;
    });

    describe('when called', () => {
      let result: boolean;

      beforeAll(() => {
        result = isInstanceBindingNode(node);
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });
  });

  describe('having a non InstanceBindingNode', () => {
    beforeAll(() => {
      node = {
        binding: {
          type: bindingTypeValues.ResolvedValue,
        },
      } as PlanServiceNodeParent;
    });

    describe('when called', () => {
      let result: boolean;

      beforeAll(() => {
        result = isInstanceBindingNode(node);
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });
  });
});
