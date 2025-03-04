import { beforeAll, describe, expect, it } from 'vitest';

import { ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding';
import { BindingNodeParent } from '../models/BindingNodeParent';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { PlanServiceRedirectionBindingNode } from '../models/PlanServiceRedirectionBindingNode';
import { isPlanServiceRedirectionBindingNode } from './isPlanServiceRedirectionBindingNode';

describe(isPlanServiceRedirectionBindingNode.name, () => {
  describe('having a PlanServiceRedirectionBindingNode', () => {
    let planServiceRedirectionBindingNodeFixture: PlanServiceRedirectionBindingNode;

    beforeAll(() => {
      planServiceRedirectionBindingNodeFixture = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        binding: Symbol() as unknown as ServiceRedirectionBinding<any>,
        parent: Symbol() as unknown as BindingNodeParent,
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
        parent: undefined,
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
