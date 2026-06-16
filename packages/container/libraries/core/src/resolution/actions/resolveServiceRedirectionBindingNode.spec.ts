import { beforeAll, describe, expect, it, type Mocked, vitest } from 'vitest';

import { bindingScopeValues } from '../../binding/models/BindingScope.js';
import { bindingTypeValues } from '../../binding/models/BindingType.js';
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
      nodeFixture = {
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
      nodeRedirectionFixture = {
        binding: {
          id: 1,
          isSatisfiedBy: () => true,
          moduleId: undefined,
          serviceIdentifier: 'target-service-id',
          targetServiceIdentifier: 'another-target-service-id',
          type: bindingTypeValues.ServiceRedirection,
        },
        redirections: [],
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

      nodeFixture.redirections.push(nodeRedirectionFixture);
      nodeRedirectionFixture.redirections.push(bindingNodeMock);
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
