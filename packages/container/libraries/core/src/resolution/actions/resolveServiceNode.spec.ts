import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('./resolveMultipleBindingServiceNode.js'));

import { type LeafBindingNode } from '../../planning/models/LeafBindingNode.js';
import { type PlanBindingNode } from '../../planning/models/PlanBindingNode.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveMultipleBindingServiceNode } from './resolveMultipleBindingServiceNode.js';
import { resolveServiceNode } from './resolveServiceNode.js';

describe(resolveServiceNode, () => {
  describe('having a service node with undefined bindings', () => {
    let resolutionParamsFixture: ResolutionParams;
    let serviceNodeFixture: PlanServiceNode;

    beforeAll(() => {
      resolutionParamsFixture = Symbol() as unknown as ResolutionParams;
      serviceNodeFixture = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: Symbol(),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveServiceNode(
          resolutionParamsFixture,
          serviceNodeFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a service node with multiple bindings', () => {
    let planBindingNodeListFixture: PlanBindingNode[];
    let resolutionParamsFixture: ResolutionParams;
    let serviceNodeFixture: PlanServiceNode;

    beforeAll(() => {
      planBindingNodeListFixture = [Symbol() as unknown as PlanBindingNode];
      resolutionParamsFixture = Symbol() as unknown as ResolutionParams;
      serviceNodeFixture = {
        bindings: planBindingNodeListFixture,
        isContextFree: true,
        serviceIdentifier: Symbol(),
      };
    });

    describe('when called', () => {
      let resolveMultipleBindingServiceNodeResult: unknown[];

      let result: unknown;

      beforeAll(() => {
        resolveMultipleBindingServiceNodeResult = [Symbol()];

        vitest
          .mocked(resolveMultipleBindingServiceNode)
          .mockReturnValueOnce(resolveMultipleBindingServiceNodeResult);

        result = resolveServiceNode(
          resolutionParamsFixture,
          serviceNodeFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveMultipleBindingServiceNode()', () => {
        expect(
          resolveMultipleBindingServiceNode,
        ).toHaveBeenCalledExactlyOnceWith(
          resolutionParamsFixture,
          planBindingNodeListFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(resolveMultipleBindingServiceNodeResult);
      });
    });
  });

  describe('having a service node with a single binding', () => {
    let planBindingNodeMock: Mocked<LeafBindingNode<unknown>>;
    let resolutionParamsFixture: ResolutionParams;
    let serviceNodeFixture: PlanServiceNode;

    beforeAll(() => {
      planBindingNodeMock = {
        resolve: vitest.fn(),
      } as Partial<Mocked<LeafBindingNode<unknown>>> as Mocked<
        LeafBindingNode<unknown>
      >;
      resolutionParamsFixture = Symbol() as unknown as ResolutionParams;
      serviceNodeFixture = {
        bindings: planBindingNodeMock,
        isContextFree: true,
        serviceIdentifier: Symbol(),
      };
    });

    describe('when called', () => {
      let resolveResult: unknown;

      let result: unknown;

      beforeAll(() => {
        resolveResult = Symbol();

        planBindingNodeMock.resolve.mockReturnValueOnce(resolveResult);

        result = resolveServiceNode(
          resolutionParamsFixture,
          serviceNodeFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindings.resolve()', () => {
        expect(planBindingNodeMock.resolve).toHaveBeenCalledExactlyOnceWith(
          resolutionParamsFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(resolveResult);
      });
    });
  });
});
