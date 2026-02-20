import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type ResolvedValueBindingNode } from '../../planning/models/ResolvedValueBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveResolvedValueBindingParams } from './resolveResolvedValueBindingParams.js';

describe(resolveResolvedValueBindingParams, () => {
  describe('having ResolvedValueBindingNode with constructor param with PlanServiceNode value', () => {
    let paramNodeFixture: PlanServiceNode;
    let resolveServiceNodeMock: Mock<
      (params: ResolutionParams, serviceNode: PlanServiceNode) => unknown
    >;

    let paramsFixture: ResolutionParams;
    let nodeFixture: ResolvedValueBindingNode<ResolvedValueBinding<unknown>>;

    beforeAll(() => {
      paramNodeFixture = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: 'service-id',
      };
      resolveServiceNodeMock = vitest.fn();
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

        resolveServiceNodeMock.mockReturnValueOnce(resolvedValue);

        result = resolveResolvedValueBindingParams(resolveServiceNodeMock)(
          paramsFixture,
          nodeFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveServiceNode()', () => {
        expect(resolveServiceNodeMock).toHaveBeenCalledExactlyOnceWith(
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

        resolveServiceNodeMock.mockResolvedValueOnce(resolvedValue);

        result = resolveResolvedValueBindingParams(resolveServiceNodeMock)(
          paramsFixture,
          nodeFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveServiceNode()', () => {
        expect(resolveServiceNodeMock).toHaveBeenCalledExactlyOnceWith(
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
