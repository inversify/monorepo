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
import { type LeafBindingNode } from '../../planning/models/LeafBindingNode.js';
import { type PlanServiceRedirectionBindingNode } from '../../planning/models/PlanServiceRedirectionBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveMultipleBindingServiceNode } from './resolveMultipleBindingServiceNode.js';
import { resolveServiceRedirectionBindingNode } from './resolveServiceRedirectionBindingNode.js';

describe(resolveMultipleBindingServiceNode, () => {
  describe('having an empty bindings array', () => {
    let paramsFixture: ResolutionParams;

    beforeAll(() => {
      paramsFixture = Symbol() as unknown as ResolutionParams;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveMultipleBindingServiceNode(paramsFixture, []);
      });

      it('should return an empty array', () => {
        expect(result).toStrictEqual([]);
      });
    });
  });

  describe('having a bindings array with a plan service redirection binding node', () => {
    let paramsFixture: ResolutionParams;
    let serviceRedirectionBindingNodeFixture: PlanServiceRedirectionBindingNode;

    beforeAll(() => {
      paramsFixture = Symbol() as unknown as ResolutionParams;

      const binding: ServiceRedirectionBinding<unknown> =
        ServiceRedirectionBindingFixtures.any;

      serviceRedirectionBindingNodeFixture = {
        binding,
        redirection: {
          bindings: [],
          isContextFree: true,
          serviceIdentifier: binding.targetServiceIdentifier,
        },
        resolve: vitest.fn(),
      };
    });

    describe('when called, and resolveServiceRedirectionBindingNode() returns resolved values', () => {
      let resolvedValuesFixture: unknown[];

      let result: unknown;

      beforeAll(() => {
        resolvedValuesFixture = [Symbol(), Symbol()];

        vitest
          .mocked(resolveServiceRedirectionBindingNode)
          .mockReturnValueOnce(resolvedValuesFixture);

        result = resolveMultipleBindingServiceNode(paramsFixture, [
          serviceRedirectionBindingNodeFixture,
        ]);
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
        expect(result).toStrictEqual(resolvedValuesFixture);
      });
    });

    describe('when called, and resolveServiceRedirectionBindingNode() returns a Promise resolved value', () => {
      let resolvedValueFixture: Promise<unknown>;

      let result: unknown;

      beforeAll(async () => {
        resolvedValueFixture = Promise.resolve(Symbol());

        vitest
          .mocked(resolveServiceRedirectionBindingNode)
          .mockReturnValueOnce([resolvedValueFixture]);

        result = await resolveMultipleBindingServiceNode(paramsFixture, [
          serviceRedirectionBindingNodeFixture,
        ]);
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

      it('should return a Promise resolving to expected result', async () => {
        expect(result).toStrictEqual([await resolvedValueFixture]);
      });
    });
  });

  describe('having a bindings array with a non-plan service redirection binding node', () => {
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

        result = resolveMultipleBindingServiceNode(paramsFixture, [
          bindingNodeMock,
        ]);
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
        expect(result).toStrictEqual([bindingNodeMock.binding.value]);
      });
    });

    describe('when called, and bindingNode.resolve() returns a Promise', () => {
      let resolvedValueFixture: Promise<unknown>;

      let result: unknown;

      beforeAll(async () => {
        resolvedValueFixture = Promise.resolve(Symbol());

        bindingNodeMock.resolve.mockReturnValueOnce(resolvedValueFixture);

        result = await resolveMultipleBindingServiceNode(paramsFixture, [
          bindingNodeMock,
        ]);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingNode.resolve()', () => {
        expect(bindingNodeMock.resolve).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
        );
      });

      it('should return a Promise resolving to expected result', async () => {
        expect(result).toStrictEqual([await resolvedValueFixture]);
      });
    });
  });

  describe('having a bindings array with mixed binding nodes', () => {
    let paramsFixture: ResolutionParams;
    let serviceRedirectionBindingNodeFixture: PlanServiceRedirectionBindingNode;
    let bindingNodeMock: Mocked<LeafBindingNode<unknown>>;

    beforeAll(() => {
      paramsFixture = Symbol() as unknown as ResolutionParams;

      const binding: ServiceRedirectionBinding<unknown> =
        ServiceRedirectionBindingFixtures.any;

      serviceRedirectionBindingNodeFixture = {
        binding,
        redirection: {
          bindings: [],
          isContextFree: true,
          serviceIdentifier: binding.targetServiceIdentifier,
        },
        resolve: vitest.fn(),
      };

      bindingNodeMock = {
        binding: ConstantValueBindingFixtures.any,
        resolve: vitest.fn(),
      };
    });

    describe('when called, and all resolved values are synchronous', () => {
      let redirectionResolvedValuesFixture: unknown[];
      let leafResolvedValueFixture: unknown;

      let result: unknown;

      beforeAll(() => {
        redirectionResolvedValuesFixture = [Symbol()];
        leafResolvedValueFixture = Symbol();

        vitest
          .mocked(resolveServiceRedirectionBindingNode)
          .mockReturnValueOnce(redirectionResolvedValuesFixture);

        bindingNodeMock.resolve.mockReturnValueOnce(leafResolvedValueFixture);

        result = resolveMultipleBindingServiceNode(paramsFixture, [
          serviceRedirectionBindingNodeFixture,
          bindingNodeMock,
        ]);
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

      it('should call bindingNode.resolve()', () => {
        expect(bindingNodeMock.resolve).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toStrictEqual([
          ...redirectionResolvedValuesFixture,
          leafResolvedValueFixture,
        ]);
      });
    });
  });
});
