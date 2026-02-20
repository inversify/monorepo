import { beforeAll, describe, expect, it } from 'vitest';

import { bindingTypeValues } from '../../binding/models/BindingType.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { type PlanServiceNodeParent } from '../models/PlanServiceNodeParent.js';
import { isInstanceBindingNode } from './isInstanceBindingNode.js';

describe(isInstanceBindingNode, () => {
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
