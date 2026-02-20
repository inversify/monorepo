import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(
  import('./checkPlanServiceRedirectionBindingNodeSingleInjectionBindings.js'),
);
vitest.mock(import('./isPlanServiceRedirectionBindingNode.js'));
vitest.mock(import('./throwErrorWhenUnexpectedBindingsAmountFound.js'));

import { type InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation.js';
import { bindingTypeValues } from '../../binding/models/BindingType.js';
import { type ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding.js';
import { type SingleImmutableLinkedListNode } from '../../common/models/SingleImmutableLinkedList.js';
import { type MetadataTag } from '../../metadata/models/MetadataTag.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { checkPlanServiceRedirectionBindingNodeSingleInjectionBindings } from './checkPlanServiceRedirectionBindingNodeSingleInjectionBindings.js';
import { checkServiceNodeSingleInjectionBindings } from './checkServiceNodeSingleInjectionBindings.js';
import { isPlanServiceRedirectionBindingNode } from './isPlanServiceRedirectionBindingNode.js';
import { throwErrorWhenUnexpectedBindingsAmountFound } from './throwErrorWhenUnexpectedBindingsAmountFound.js';

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
