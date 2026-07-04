import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { PlanSingleBindingServiceNodeFixtures } from '../../planning/fixtures/PlanSingleBindingServiceNodeFixtures.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type ResolvedValueBindingNode } from '../../planning/models/ResolvedValueBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveResolvedValueBindingParams } from './resolveResolvedValueBindingParams.js';

describe(resolveResolvedValueBindingParams, () => {
  describe('having ResolvedValueBindingNode with constructor param with PlanServiceNode value', () => {
    let paramNodeMock: Mocked<PlanServiceNode>;

    let paramsFixture: ResolutionParams;
    let nodeFixture: ResolvedValueBindingNode<ResolvedValueBinding<unknown>>;

    beforeAll(() => {
      paramNodeMock = {
        ...PlanSingleBindingServiceNodeFixtures.withBindingsUndefined,
        resolve: vitest.fn(),
        serviceIdentifier: 'service-id',
      };
      paramsFixture = Symbol() as unknown as ResolutionParams;
      nodeFixture = {
        params: [paramNodeMock],
      } as Partial<
        ResolvedValueBindingNode<ResolvedValueBinding<unknown>>
      > as ResolvedValueBindingNode<ResolvedValueBinding<unknown>>;
    });

    describe('when called, and resolveServiceNode() return non Promise value', () => {
      let resolvedValue: unknown;

      let result: unknown;

      beforeAll(() => {
        resolvedValue = Symbol();

        paramNodeMock.resolve.mockReturnValueOnce(resolvedValue);

        result = resolveResolvedValueBindingParams(paramsFixture, nodeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call paramNode.resolve()', () => {
        expect(paramNodeMock.resolve).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
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

        paramNodeMock.resolve.mockResolvedValueOnce(resolvedValue);

        result = resolveResolvedValueBindingParams(paramsFixture, nodeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call paramNode.resolve()', () => {
        expect(paramNodeMock.resolve).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
        );
      });

      it('should return expected value', () => {
        expect(result).toStrictEqual(Promise.resolve([resolvedValue]));
      });
    });
  });
});
