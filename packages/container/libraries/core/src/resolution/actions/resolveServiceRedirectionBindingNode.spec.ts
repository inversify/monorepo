import { beforeAll, describe, expect, it, type Mocked, vitest } from 'vitest';

import { ServiceRedirectionBindingFixtures } from '../../binding/fixtures/ServiceRedirectionBindingFixtures.js';
import { bindingScopeValues } from '../../binding/models/BindingScope.js';
import { bindingTypeValues } from '../../binding/models/BindingType.js';
import { type ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding.js';
import { PlanMultipleBindingServiceNodeFixtures } from '../../planning/fixtures/PlanMultipleBindingServiceNodeFixtures.js';
import { type ConstantValueBindingNode } from '../../planning/models/ConstantValueBindingNode.js';
import { type PlanServiceRedirectionBindingNode } from '../../planning/models/PlanServiceRedirectionBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveServiceRedirectionBindingNode } from './resolveServiceRedirectionBindingNode.js';

describe(resolveServiceRedirectionBindingNode, () => {
  describe('having PlanServiceRedirectionBindingNode with PlanServiceRedirectionBindingNode redirection with binding node redirection', () => {
    let paramsFixture: ResolutionParams;
    let nodeFixture: PlanServiceRedirectionBindingNode;
    let nodeRedirectionFixture: PlanServiceRedirectionBindingNode;
    let bindingNodeMock: Mocked<ConstantValueBindingNode<unknown>>;

    beforeAll(() => {
      paramsFixture = Symbol() as unknown as ResolutionParams;

      const binding: ServiceRedirectionBinding<unknown> =
        ServiceRedirectionBindingFixtures.any;

      const redirectionBinding: ServiceRedirectionBinding<unknown> = {
        ...binding,
        serviceIdentifier: binding.targetServiceIdentifier,
        targetServiceIdentifier: Symbol(),
      };

      bindingNodeMock = {
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
        resolve: vitest.fn(),
      };

      nodeRedirectionFixture = {
        binding: redirectionBinding,
        redirection: {
          ...PlanMultipleBindingServiceNodeFixtures.any,
          bindings: [bindingNodeMock],
          serviceIdentifier: redirectionBinding.targetServiceIdentifier,
        },
        resolve: vitest.fn(),
      };

      nodeFixture = {
        binding,
        redirection: {
          ...PlanMultipleBindingServiceNodeFixtures.any,
          bindings: [nodeRedirectionFixture],
          serviceIdentifier: binding.targetServiceIdentifier,
        },
        resolve: vitest.fn(),
      };
    });

    describe('when called', () => {
      let resolvedValue: unknown;

      let result: unknown;

      beforeAll(() => {
        resolvedValue = Symbol();

        bindingNodeMock.resolve.mockReturnValueOnce(resolvedValue);

        result = resolveServiceRedirectionBindingNode(
          paramsFixture,
          nodeFixture,
        );
      });

      it('should call resolveBindingNode()', () => {
        expect(bindingNodeMock.resolve).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toStrictEqual([resolvedValue]);
      });
    });
  });
});
