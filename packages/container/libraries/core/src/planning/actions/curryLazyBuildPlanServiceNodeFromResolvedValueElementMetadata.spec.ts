import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

vitest.mock('./curryBuildPlanServiceNodeFromResolvedValueElementMetadata');

import { Binding } from '../../binding/models/Binding';
import { InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList';
import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { ResolvedValueElementMetadata } from '../../metadata/models/ResolvedValueElementMetadata';
import { BasePlanParams } from '../models/BasePlanParams';
import { BindingNodeParent } from '../models/BindingNodeParent';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { SubplanParams } from '../models/SubplanParams';
import { curryBuildPlanServiceNodeFromResolvedValueElementMetadata } from './curryBuildPlanServiceNodeFromResolvedValueElementMetadata';
import { curryLazyBuildPlanServiceNodeFromResolvedValueElementMetadata } from './curryLazyBuildPlanServiceNodeFromResolvedValueElementMetadata';

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
