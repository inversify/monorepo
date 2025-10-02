import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('./isPlanServiceRedirectionBindingNode');
vitest.mock('./throwErrorWhenUnexpectedBindingsAmountFound');

import { InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation';
import { bindingScopeValues } from '../../binding/models/BindingScope';
import { bindingTypeValues } from '../../binding/models/BindingType';
import { ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding';
import { SingleImmutableLinkedListNode } from '../../common/models/SingleImmutableLinkedList';
import { MetadataTag } from '../../metadata/models/MetadataTag';
import { PlanServiceRedirectionBindingNode } from '../models/PlanServiceRedirectionBindingNode';
import { checkPlanServiceRedirectionBindingNodeSingleInjectionBindings } from './checkPlanServiceRedirectionBindingNodeSingleInjectionBindings';
import { isPlanServiceRedirectionBindingNode } from './isPlanServiceRedirectionBindingNode';
import { throwErrorWhenUnexpectedBindingsAmountFound } from './throwErrorWhenUnexpectedBindingsAmountFound';

describe(checkPlanServiceRedirectionBindingNodeSingleInjectionBindings, () => {
  describe('having a PlanServiceRedirectionBindingNode with no redirections', () => {
    let planServiceRedirectionBindingNodeFixture: PlanServiceRedirectionBindingNode;
    let isOptionalFixture: boolean;
    let internalBindingConstraintsNodeFixture: SingleImmutableLinkedListNode<InternalBindingConstraints>;

    beforeAll(() => {
      planServiceRedirectionBindingNodeFixture = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        binding: Symbol() as unknown as ServiceRedirectionBinding<any>,
        redirections: [],
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
        result = checkPlanServiceRedirectionBindingNodeSingleInjectionBindings(
          planServiceRedirectionBindingNodeFixture,
          isOptionalFixture,
          internalBindingConstraintsNodeFixture,
          [],
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call throwErrorWhenUnexpectedBindingsAmountFound()', () => {
        expect(
          throwErrorWhenUnexpectedBindingsAmountFound,
        ).toHaveBeenCalledExactlyOnceWith(
          planServiceRedirectionBindingNodeFixture.redirections,
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

  describe('having a PlanServiceRedirectionBindingNode with a single redirection to a leaf node', () => {
    let planServiceRedirectionBindingNodeFixture: PlanServiceRedirectionBindingNode;
    let isOptionalFixture: boolean;
    let internalBindingConstraintsNodeFixture: SingleImmutableLinkedListNode<InternalBindingConstraints>;

    beforeAll(() => {
      planServiceRedirectionBindingNodeFixture = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        binding: Symbol() as unknown as ServiceRedirectionBinding<any>,
        redirections: [
          {
            binding: {
              cache: {
                isRight: true,
                value: Symbol(),
              },
              id: 1,
              isSatisfiedBy: () => true,
              moduleId: undefined,
              onActivation: undefined,
              onDeactivation: undefined,
              scope: bindingScopeValues.Singleton,
              serviceIdentifier: 'service-id',
              type: bindingTypeValues.ConstantValue,
              value: Symbol(),
            },
          },
        ],
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

        result = checkPlanServiceRedirectionBindingNodeSingleInjectionBindings(
          planServiceRedirectionBindingNodeFixture,
          isOptionalFixture,
          internalBindingConstraintsNodeFixture,
          [],
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
  });

  describe('having a PlanServiceRedirectionBindingNode with a single redirection to a PlanServiceRedirectionBindingNode with no redirections', () => {
    let planServiceRedirectionBindingNodeRedirectionFixture: PlanServiceRedirectionBindingNode;
    let planServiceRedirectionBindingNodeFixture: PlanServiceRedirectionBindingNode;
    let isOptionalFixture: boolean;
    let internalBindingConstraintsNodeFixture: SingleImmutableLinkedListNode<InternalBindingConstraints>;

    beforeAll(() => {
      planServiceRedirectionBindingNodeRedirectionFixture = {
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
      planServiceRedirectionBindingNodeFixture = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        binding: Symbol() as unknown as ServiceRedirectionBinding<any>,
        redirections: [planServiceRedirectionBindingNodeRedirectionFixture],
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

    describe('when called, and isPlanServiceRedirectionBindingNode() returns true', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(isPlanServiceRedirectionBindingNode)
          .mockReturnValueOnce(true);

        result = checkPlanServiceRedirectionBindingNodeSingleInjectionBindings(
          planServiceRedirectionBindingNodeFixture,
          isOptionalFixture,
          internalBindingConstraintsNodeFixture,
          [],
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call throwErrorWhenUnexpectedBindingsAmountFound()', () => {
        expect(
          throwErrorWhenUnexpectedBindingsAmountFound,
        ).toHaveBeenCalledExactlyOnceWith(
          planServiceRedirectionBindingNodeRedirectionFixture.redirections,
          isOptionalFixture,
          internalBindingConstraintsNodeFixture,
          [
            planServiceRedirectionBindingNodeRedirectionFixture.binding
              .targetServiceIdentifier,
          ],
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
