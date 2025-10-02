import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('./checkPlanServiceRedirectionBindingNodeSingleInjectionBindings');
vitest.mock('./isPlanServiceRedirectionBindingNode');
vitest.mock('./throwErrorWhenUnexpectedBindingsAmountFound');

import { InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation';
import { bindingTypeValues } from '../../binding/models/BindingType';
import { ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding';
import { SingleImmutableLinkedListNode } from '../../common/models/SingleImmutableLinkedList';
import { MetadataTag } from '../../metadata/models/MetadataTag';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { checkPlanServiceRedirectionBindingNodeSingleInjectionBindings } from './checkPlanServiceRedirectionBindingNodeSingleInjectionBindings';
import { checkServiceNodeSingleInjectionBindings } from './checkServiceNodeSingleInjectionBindings';
import { isPlanServiceRedirectionBindingNode } from './isPlanServiceRedirectionBindingNode';
import { throwErrorWhenUnexpectedBindingsAmountFound } from './throwErrorWhenUnexpectedBindingsAmountFound';

describe(checkServiceNodeSingleInjectionBindings, () => {
  describe('having a PlanServiceNode with no bindings', () => {
    let nodeFixture: PlanServiceNode;
    let isOptionalFixture: boolean;
    let internalBindingConstraintsNodeFixture: SingleImmutableLinkedListNode<InternalBindingConstraints>;

    beforeAll(() => {
      nodeFixture = {
        bindings: [],
        isContextFree: true,
        serviceIdentifier: 'service-id',
      };
      isOptionalFixture = false;
      internalBindingConstraintsNodeFixture = {
        elem: {
          getAncestorsCalled: false,
          name: 'binding-name',
          serviceIdentifier: 'service-identifier',
          tags: new Map<MetadataTag, unknown>([
            ['tag1', 'value1'],
            ['tag2', 'value2'],
          ]),
        },
        previous: undefined,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = checkServiceNodeSingleInjectionBindings(
          nodeFixture,
          isOptionalFixture,
          internalBindingConstraintsNodeFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call throwErrorWhenUnexpectedBindingsAmountFound()', () => {
        expect(
          throwErrorWhenUnexpectedBindingsAmountFound,
        ).toHaveBeenCalledExactlyOnceWith(
          nodeFixture.bindings,
          isOptionalFixture,
          internalBindingConstraintsNodeFixture,
          [],
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a PlanServiceNode with single binding', () => {
    let nodeFixtureBinding: PlanBindingNode;
    let nodeFixture: PlanServiceNode;
    let isOptionalFixture: boolean;
    let internalBindingConstraintsNodeFixture: SingleImmutableLinkedListNode<InternalBindingConstraints>;

    beforeAll(() => {
      nodeFixtureBinding = {
        binding: {
          id: 1,
          isSatisfiedBy: () => true,
          moduleId: undefined,
          serviceIdentifier: 'service-id',
          targetServiceIdentifier: 'target-service-id',
          type: bindingTypeValues.ServiceRedirection,
        },
        redirections: [],
      };
      nodeFixture = {
        bindings: [nodeFixtureBinding],
        isContextFree: true,
        serviceIdentifier: 'service-id',
      };
      isOptionalFixture = false;
      internalBindingConstraintsNodeFixture = {
        elem: {
          getAncestorsCalled: false,
          name: 'binding-name',
          serviceIdentifier: 'service-identifier',
          tags: new Map<MetadataTag, unknown>([
            ['tag1', 'value1'],
            ['tag2', 'value2'],
          ]),
        },
        previous: undefined,
      };
    });

    describe('when called, and isPlanServiceRedirectionBindingNode() returns false', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(isPlanServiceRedirectionBindingNode)
          .mockReturnValueOnce(false);

        result = checkServiceNodeSingleInjectionBindings(
          nodeFixture,
          isOptionalFixture,
          internalBindingConstraintsNodeFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should not call throwErrorWhenUnexpectedBindingsAmountFound()', () => {
        expect(
          throwErrorWhenUnexpectedBindingsAmountFound,
        ).not.toHaveBeenCalled();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called, and isPlanServiceRedirectionBindingNode() returns true', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(isPlanServiceRedirectionBindingNode)
          .mockReturnValueOnce(true);

        result = checkServiceNodeSingleInjectionBindings(
          nodeFixture,
          isOptionalFixture,
          internalBindingConstraintsNodeFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call checkPlanServiceRedirectionBindingNodeSingleInjectionBindings()', () => {
        expect(
          checkPlanServiceRedirectionBindingNodeSingleInjectionBindings,
        ).toHaveBeenCalledExactlyOnceWith(
          nodeFixtureBinding,
          isOptionalFixture,
          internalBindingConstraintsNodeFixture,
          [
            (nodeFixtureBinding.binding as ServiceRedirectionBinding<unknown>)
              .targetServiceIdentifier,
          ],
        );
      });

      it('should not call throwErrorWhenUnexpectedBindingsAmountFound()', () => {
        expect(
          throwErrorWhenUnexpectedBindingsAmountFound,
        ).not.toHaveBeenCalled();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
