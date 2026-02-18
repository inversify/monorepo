import { beforeAll, describe, expect, it } from 'vitest';

import { type ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { type PlanServiceRedirectionBindingNode } from '../models/PlanServiceRedirectionBindingNode.js';
import { isPlanServiceRedirectionBindingNode } from './isPlanServiceRedirectionBindingNode.js';

describe(isPlanServiceRedirectionBindingNode, () => {
  describe('having a PlanServiceRedirectionBindingNode', () => {
    let planServiceRedirectionBindingNodeFixture: PlanServiceRedirectionBindingNode;

    beforeAll(() => {
      planServiceRedirectionBindingNodeFixture = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        binding: Symbol() as unknown as ServiceRedirectionBinding<any>,
        redirections: [],
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isPlanServiceRedirectionBindingNode(
          planServiceRedirectionBindingNodeFixture,
        );
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });
  });

  describe('having a PlanServiceNode', () => {
    let planServiceNodeFixture: PlanServiceNode;

    beforeAll(() => {
      planServiceNodeFixture = {
        bindings: [],
        isContextFree: true,
        serviceIdentifier: 'service-id',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isPlanServiceRedirectionBindingNode(planServiceNodeFixture);
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });
  });
});
