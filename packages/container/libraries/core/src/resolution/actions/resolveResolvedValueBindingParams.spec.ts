import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

import { ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding';
import { PlanServiceNode } from '../../planning/models/PlanServiceNode';
import { ResolvedValueBindingNode } from '../../planning/models/ResolvedValueBindingNode';
import { ResolutionParams } from '../models/ResolutionParams';
import { resolveResolvedValueBindingParams } from './resolveResolvedValueBindingParams';

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
