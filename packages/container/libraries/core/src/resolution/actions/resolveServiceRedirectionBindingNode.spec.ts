import { beforeAll, describe, expect, it, type Mock, vitest } from 'vitest';

import { bindingScopeValues } from '../../binding/models/BindingScope.js';
import { bindingTypeValues } from '../../binding/models/BindingType.js';
import { type LeafBindingNode } from '../../planning/models/LeafBindingNode.js';
import { type PlanBindingNode } from '../../planning/models/PlanBindingNode.js';
import { type PlanServiceNodeParent } from '../../planning/models/PlanServiceNodeParent.js';
import { type PlanServiceRedirectionBindingNode } from '../../planning/models/PlanServiceRedirectionBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveServiceRedirectionBindingNode } from './resolveServiceRedirectionBindingNode.js';

describe(resolveServiceRedirectionBindingNode, () => {
  describe('having PlanServiceRedirectionBindingNode with PlanServiceRedirectionBindingNode redirection with binding node redirection', () => {
    let resolveBindingNodeMock: Mock<
      (
        params: ResolutionParams,
        planBindingNode: PlanServiceNodeParent | LeafBindingNode,
      ) => unknown
    >;
    let paramsFixture: ResolutionParams;
    let nodeFixture: PlanServiceRedirectionBindingNode;
    let nodeRedirectionFixture: PlanServiceRedirectionBindingNode;
    let bindingNodeFixture: PlanBindingNode;

    beforeAll(() => {
      resolveBindingNodeMock = vitest.fn();
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

      bindingNodeFixture = {
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
      };

      nodeFixture.redirections.push(nodeRedirectionFixture);
      nodeRedirectionFixture.redirections.push(bindingNodeFixture);
    });

    describe('when called', () => {
      let resolvedValue: unknown;

      let result: unknown;

      beforeAll(() => {
        resolvedValue = Symbol();

        resolveBindingNodeMock.mockReturnValueOnce(resolvedValue);

        result = resolveServiceRedirectionBindingNode(resolveBindingNodeMock)(
          paramsFixture,
          nodeFixture,
        );
      });

      it('should call resolveBindingNode()', () => {
        expect(resolveBindingNodeMock).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
          bindingNodeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toStrictEqual([resolvedValue]);
      });
    });
  });
});
