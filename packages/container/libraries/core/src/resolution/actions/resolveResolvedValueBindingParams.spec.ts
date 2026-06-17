import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./resolveServiceNode.js'));

import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type ResolvedValueBindingNode } from '../../planning/models/ResolvedValueBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveResolvedValueBindingParams } from './resolveResolvedValueBindingParams.js';
import { resolveServiceNode } from './resolveServiceNode.js';

describe(resolveResolvedValueBindingParams, () => {
  describe('having ResolvedValueBindingNode with constructor param with PlanServiceNode value', () => {
    let paramNodeFixture: PlanServiceNode;

    let paramsFixture: ResolutionParams;
    let nodeFixture: ResolvedValueBindingNode<ResolvedValueBinding<unknown>>;

    beforeAll(() => {
      paramNodeFixture = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: 'service-id',
      };
      paramsFixture = Symbol() as unknown as ResolutionParams;
      nodeFixture = {
        params: [paramNodeFixture],
      } as Partial<
        ResolvedValueBindingNode<ResolvedValueBinding<unknown>>
      > as ResolvedValueBindingNode<ResolvedValueBinding<unknown>>;
    });

    describe('when called, and resolveServiceNode() return non Promise value', () => {
      let resolvedValue: unknown;

      let result: unknown;

      beforeAll(() => {
        resolvedValue = Symbol();

        vitest.mocked(resolveServiceNode).mockReturnValueOnce(resolvedValue);

        result = resolveResolvedValueBindingParams(paramsFixture, nodeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveServiceNode()', () => {
        expect(resolveServiceNode).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
          paramNodeFixture,
        );
      });

      it('should return expected value', () => {
        expect(result).toStrictEqual([resolvedValue]);
      });
    });

    describe('when called, and resolveServiceNode() return Promise value', () => {
      let resolvedValue: unknown;

      let result: unknown;

      beforeAll(() => {
        resolvedValue = Symbol();

        vitest.mocked(resolveServiceNode).mockResolvedValueOnce(resolvedValue);

        result = resolveResolvedValueBindingParams(paramsFixture, nodeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveServiceNode()', () => {
        expect(resolveServiceNode).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
          paramNodeFixture,
        );
      });

      it('should return expected value', () => {
        expect(result).toStrictEqual(Promise.resolve([resolvedValue]));
      });
    });
  });
});
