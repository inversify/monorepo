import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

vitest.mock(
  import('./curryBuildPlanServiceNodeFromResolvedValueElementMetadata.js'),
);

import { type Binding } from '../../binding/models/Binding.js';
import { type InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation.js';
import { type SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList.js';
import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { type ResolvedValueElementMetadata } from '../../metadata/models/ResolvedValueElementMetadata.js';
import { type BasePlanParams } from '../models/BasePlanParams.js';
import { type BindingNodeParent } from '../models/BindingNodeParent.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { type SubplanParams } from '../models/SubplanParams.js';
import { curryBuildPlanServiceNodeFromResolvedValueElementMetadata } from './curryBuildPlanServiceNodeFromResolvedValueElementMetadata.js';
import { curryLazyBuildPlanServiceNodeFromResolvedValueElementMetadata } from './curryLazyBuildPlanServiceNodeFromResolvedValueElementMetadata.js';

describe(curryLazyBuildPlanServiceNodeFromResolvedValueElementMetadata, () => {
  let buildServiceNodeBindingsFixture: Mock<
    (
      params: BasePlanParams,
      bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
      serviceBindings: Binding<unknown>[],
      parentNode: BindingNodeParent,
      chainedBindings: boolean,
    ) => PlanBindingNode[]
  >;

  let paramsFixture: SubplanParams;
  let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;
  let elementMetadataFixture: ResolvedValueElementMetadata;

  beforeAll(() => {
    buildServiceNodeBindingsFixture = vitest.fn();

    paramsFixture = Symbol() as unknown as SubplanParams;
    bindingConstraintsListFixture =
      Symbol() as unknown as SingleImmutableLinkedList<InternalBindingConstraints>;
    elementMetadataFixture =
      Symbol() as unknown as ResolvedValueElementMetadata;
  });

  describe('when called', () => {
    let buildPlanServiceNodeFromResolvedValueElementMetadataMock: Mock<
      (
        params: SubplanParams,
        bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
        elementMetadata: ResolvedValueElementMetadata,
      ) => PlanServiceNode
    >;

    let planServiceNodeFixture: PlanServiceNode;

    let result: unknown;

    beforeAll(() => {
      planServiceNodeFixture = Symbol() as unknown as PlanServiceNode;

      buildPlanServiceNodeFromResolvedValueElementMetadataMock = vitest
        .fn()
        .mockReturnValueOnce(planServiceNodeFixture);

      vitest
        .mocked(curryBuildPlanServiceNodeFromResolvedValueElementMetadata)
        .mockReturnValueOnce(
          buildPlanServiceNodeFromResolvedValueElementMetadataMock,
        );

      result = curryLazyBuildPlanServiceNodeFromResolvedValueElementMetadata(
        buildServiceNodeBindingsFixture,
      )(paramsFixture, bindingConstraintsListFixture, elementMetadataFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call curryBuildPlanServiceNodeFromResolvedValueElementMetadata()', () => {
      expect(
        curryBuildPlanServiceNodeFromResolvedValueElementMetadata,
      ).toHaveBeenCalledExactlyOnceWith(buildServiceNodeBindingsFixture);
    });

    it('should return a PlanServiceNode', () => {
      expect(result).toBe(planServiceNodeFixture);
    });
  });

  describe('when called, and buildPlanServiceNodeFromResolvedValueElementMetadata() throws an Error', () => {
    let buildPlanServiceNodeFromResolvedValueElementMetadataMock: Mock<
      (
        params: SubplanParams,
        bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
        elementMetadata: ResolvedValueElementMetadata,
      ) => PlanServiceNode
    >;

    let errorFixture: Error;

    let result: unknown;

    beforeAll(() => {
      errorFixture = new Error('Test error');

      buildPlanServiceNodeFromResolvedValueElementMetadataMock = vitest
        .fn()
        .mockImplementationOnce((): never => {
          throw errorFixture;
        });

      vitest
        .mocked(curryBuildPlanServiceNodeFromResolvedValueElementMetadata)
        .mockReturnValueOnce(
          buildPlanServiceNodeFromResolvedValueElementMetadataMock,
        );

      try {
        curryLazyBuildPlanServiceNodeFromResolvedValueElementMetadata(
          buildServiceNodeBindingsFixture,
        )(paramsFixture, bindingConstraintsListFixture, elementMetadataFixture);
      } catch (error: unknown) {
        result = error;
      }
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call curryBuildPlanServiceNodeFromResolvedValueElementMetadata()', () => {
      expect(
        curryBuildPlanServiceNodeFromResolvedValueElementMetadata,
      ).toHaveBeenCalledExactlyOnceWith(buildServiceNodeBindingsFixture);
    });

    it('should throw an Error', () => {
      expect(result).toBe(errorFixture);
    });
  });

  describe('when called, and buildPlanServiceNodeFromResolvedValueElementMetadata() throws an InversifyCoreError', () => {
    let buildPlanServiceNodeFromResolvedValueElementMetadataMock: Mock<
      (
        params: SubplanParams,
        bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
        elementMetadata: ResolvedValueElementMetadata,
      ) => PlanServiceNode
    >;

    let errorFixture: InversifyCoreError;

    let result: unknown;

    beforeAll(() => {
      errorFixture = new InversifyCoreError(
        InversifyCoreErrorKind.planning,
        'Test error',
      );

      buildPlanServiceNodeFromResolvedValueElementMetadataMock = vitest
        .fn()
        .mockImplementationOnce((): never => {
          throw errorFixture;
        });

      vitest
        .mocked(curryBuildPlanServiceNodeFromResolvedValueElementMetadata)
        .mockReturnValueOnce(
          buildPlanServiceNodeFromResolvedValueElementMetadataMock,
        );

      result = curryLazyBuildPlanServiceNodeFromResolvedValueElementMetadata(
        buildServiceNodeBindingsFixture,
      )(paramsFixture, bindingConstraintsListFixture, elementMetadataFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call curryBuildPlanServiceNodeFromResolvedValueElementMetadata()', () => {
      expect(
        curryBuildPlanServiceNodeFromResolvedValueElementMetadata,
      ).toHaveBeenCalledExactlyOnceWith(buildServiceNodeBindingsFixture);
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });
});
