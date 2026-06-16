import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./resolveMultipleBindingServiceNode.js'));
vitest.mock(import('./resolveSingleBindingServiceNode.js'));

import { type PlanBindingNode } from '../../planning/models/PlanBindingNode.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveMultipleBindingServiceNode } from './resolveMultipleBindingServiceNode.js';
import { resolveServiceNode } from './resolveServiceNode.js';
import { resolveSingleBindingServiceNode } from './resolveSingleBindingServiceNode.js';

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
    let planBindingNodeFixture: PlanBindingNode;
    let resolutionParamsFixture: ResolutionParams;
    let serviceNodeFixture: PlanServiceNode;

    beforeAll(() => {
      planBindingNodeFixture = Symbol() as unknown as PlanBindingNode;
      resolutionParamsFixture = Symbol() as unknown as ResolutionParams;
      serviceNodeFixture = {
        bindings: planBindingNodeFixture,
        isContextFree: true,
        serviceIdentifier: Symbol(),
      };
    });

    describe('when called', () => {
      let resolveSingleBindingServiceNodeResult: unknown;

      let result: unknown;

      beforeAll(() => {
        resolveSingleBindingServiceNodeResult = Symbol();

        vitest
          .mocked(resolveSingleBindingServiceNode)
          .mockReturnValueOnce(resolveSingleBindingServiceNodeResult);

        result = resolveServiceNode(
          resolutionParamsFixture,
          serviceNodeFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveSingleBindingServiceNode()', () => {
        expect(resolveSingleBindingServiceNode).toHaveBeenCalledExactlyOnceWith(
          resolutionParamsFixture,
          planBindingNodeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(resolveSingleBindingServiceNodeResult);
      });
    });
  });
});
