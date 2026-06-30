import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('./resolveServiceRedirectionBindingNode.js'));

import { ConstantValueBindingFixtures } from '../../binding/fixtures/ConstantValueBindingFixtures.js';
import { ServiceRedirectionBindingFixtures } from '../../binding/fixtures/ServiceRedirectionBindingFixtures.js';
import { type ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding.js';
import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { type LeafBindingNode } from '../../planning/models/LeafBindingNode.js';
import { type PlanServiceRedirectionBindingNode } from '../../planning/models/PlanServiceRedirectionBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveServiceRedirectionBindingNode } from './resolveServiceRedirectionBindingNode.js';
import { resolveSingleBindingServiceNode } from './resolveSingleBindingServiceNode.js';

describe(resolveSingleBindingServiceNode, () => {
  describe('having a plan service redirection binding node', () => {
    let paramsFixture: ResolutionParams;
    let serviceRedirectionBindingNodeFixture: PlanServiceRedirectionBindingNode;

    beforeAll(() => {
      paramsFixture = Symbol() as unknown as ResolutionParams;

      const binding: ServiceRedirectionBinding<unknown> =
        ServiceRedirectionBindingFixtures.any;

      serviceRedirectionBindingNodeFixture = {
        binding: ServiceRedirectionBindingFixtures.any,
        redirection: {
          bindings: [],
          isContextFree: true,
          serviceIdentifier: binding.targetServiceIdentifier,
        },
      };
    });

    describe('when called, and resolveServiceRedirectionBindingNode() returns an array with a single resolved value', () => {
      let resolvedValueFixture: unknown;

      let result: unknown;

      beforeAll(() => {
        resolvedValueFixture = Symbol();

        vitest
          .mocked(resolveServiceRedirectionBindingNode)
          .mockReturnValueOnce([resolvedValueFixture]);

        result = resolveSingleBindingServiceNode(
          paramsFixture,
          serviceRedirectionBindingNodeFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveServiceRedirectionBindingNode()', () => {
        expect(
          resolveServiceRedirectionBindingNode,
        ).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
          serviceRedirectionBindingNodeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(resolvedValueFixture);
      });
    });

    describe('when called, and resolveServiceRedirectionBindingNode() returns an array with no resolved values', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(resolveServiceRedirectionBindingNode)
          .mockReturnValueOnce([]);

        try {
          resolveSingleBindingServiceNode(
            paramsFixture,
            serviceRedirectionBindingNodeFixture,
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveServiceRedirectionBindingNode()', () => {
        expect(
          resolveServiceRedirectionBindingNode,
        ).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
          serviceRedirectionBindingNodeFixture,
        );
      });

      it('should throw an InversifyCoreError', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.resolution,
          message: 'Unexpected multiple resolved values on single injection',
        };

        expect(result).toBeInstanceOf(InversifyCoreError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });

  describe('having a non-plan service redirection binding node', () => {
    let paramsFixture: ResolutionParams;
    let bindingNodeMock: Mocked<LeafBindingNode<unknown>>;

    beforeAll(() => {
      paramsFixture = Symbol() as unknown as ResolutionParams;
      bindingNodeMock = {
        binding: ConstantValueBindingFixtures.any,
        resolve: vitest.fn(),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        bindingNodeMock.resolve.mockReturnValueOnce(
          bindingNodeMock.binding.value,
        );

        result = resolveSingleBindingServiceNode(
          paramsFixture,
          bindingNodeMock,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingNode.resolve()', () => {
        expect(bindingNodeMock.resolve).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(bindingNodeMock.binding.value);
      });
    });
  });
});
