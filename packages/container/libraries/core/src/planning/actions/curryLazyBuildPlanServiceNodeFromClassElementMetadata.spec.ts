import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

vitest.mock('./curryBuildPlanServiceNodeFromClassElementMetadata');

import { Binding } from '../../binding/models/Binding';
import { InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList';
import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { ClassElementMetadata } from '../../metadata/models/ClassElementMetadata';
import { ManagedClassElementMetadata } from '../../metadata/models/ManagedClassElementMetadata';
import { BasePlanParams } from '../models/BasePlanParams';
import { BindingNodeParent } from '../models/BindingNodeParent';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { SubplanParams } from '../models/SubplanParams';
import { curryBuildPlanServiceNodeFromClassElementMetadata } from './curryBuildPlanServiceNodeFromClassElementMetadata';
import { curryLazyBuildPlanServiceNodeFromClassElementMetadata } from './curryLazyBuildPlanServiceNodeFromClassElementMetadata';

describe(curryLazyBuildPlanServiceNodeFromClassElementMetadata, () => {
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
  let elementMetadataFixture: ManagedClassElementMetadata;

  beforeAll(() => {
    buildServiceNodeBindingsFixture = vitest.fn();

    paramsFixture = Symbol() as unknown as SubplanParams;
    bindingConstraintsListFixture =
      Symbol() as unknown as SingleImmutableLinkedList<InternalBindingConstraints>;
    elementMetadataFixture = Symbol() as unknown as ManagedClassElementMetadata;
  });

  describe('when called', () => {
    let buildPlanServiceNodeFromClassElementMetadataMock: Mock<
      (
        params: SubplanParams,
        bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
        elementMetadata: ClassElementMetadata,
      ) => PlanServiceNode
    >;

    let planServiceNodeFixture: PlanServiceNode;

    let result: unknown;

    beforeAll(() => {
      planServiceNodeFixture = Symbol() as unknown as PlanServiceNode;

      buildPlanServiceNodeFromClassElementMetadataMock = vitest
        .fn()
        .mockReturnValueOnce(planServiceNodeFixture);

      vitest
        .mocked(curryBuildPlanServiceNodeFromClassElementMetadata)
        .mockReturnValueOnce(buildPlanServiceNodeFromClassElementMetadataMock);

      result = curryLazyBuildPlanServiceNodeFromClassElementMetadata(
        buildServiceNodeBindingsFixture,
      )(paramsFixture, bindingConstraintsListFixture, elementMetadataFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call curryBuildPlanServiceNodeFromClassElementMetadata()', () => {
      expect(
        curryBuildPlanServiceNodeFromClassElementMetadata,
      ).toHaveBeenCalledExactlyOnceWith(buildServiceNodeBindingsFixture);
    });

    it('should return a PlanServiceNode', () => {
      expect(result).toBe(planServiceNodeFixture);
    });
  });

  describe('when called, and buildPlanServiceNodeFromClassElementMetadata() throws an Error', () => {
    let buildPlanServiceNodeFromClassElementMetadataMock: Mock<
      (
        params: SubplanParams,
        bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
        elementMetadata: ClassElementMetadata,
      ) => PlanServiceNode
    >;

    let errorFixture: Error;

    let result: unknown;

    beforeAll(() => {
      errorFixture = new Error('Test error');

      buildPlanServiceNodeFromClassElementMetadataMock = vitest
        .fn()
        .mockImplementationOnce((): never => {
          throw errorFixture;
        });

      vitest
        .mocked(curryBuildPlanServiceNodeFromClassElementMetadata)
        .mockReturnValueOnce(buildPlanServiceNodeFromClassElementMetadataMock);

      try {
        curryLazyBuildPlanServiceNodeFromClassElementMetadata(
          buildServiceNodeBindingsFixture,
        )(paramsFixture, bindingConstraintsListFixture, elementMetadataFixture);
      } catch (error: unknown) {
        result = error;
      }
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call curryBuildPlanServiceNodeFromClassElementMetadata()', () => {
      expect(
        curryBuildPlanServiceNodeFromClassElementMetadata,
      ).toHaveBeenCalledExactlyOnceWith(buildServiceNodeBindingsFixture);
    });

    it('should throw an Error', () => {
      expect(result).toBe(errorFixture);
    });
  });

  describe('when called, and buildPlanServiceNodeFromClassElementMetadata() throws an InversifyCoreError', () => {
    let buildPlanServiceNodeFromClassElementMetadataMock: Mock<
      (
        params: SubplanParams,
        bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
        elementMetadata: ClassElementMetadata,
      ) => PlanServiceNode
    >;

    let errorFixture: InversifyCoreError;

    let result: unknown;

    beforeAll(() => {
      errorFixture = new InversifyCoreError(
        InversifyCoreErrorKind.planning,
        'Test error',
      );

      buildPlanServiceNodeFromClassElementMetadataMock = vitest
        .fn()
        .mockImplementationOnce((): never => {
          throw errorFixture;
        });

      vitest
        .mocked(curryBuildPlanServiceNodeFromClassElementMetadata)
        .mockReturnValueOnce(buildPlanServiceNodeFromClassElementMetadataMock);

      result = curryLazyBuildPlanServiceNodeFromClassElementMetadata(
        buildServiceNodeBindingsFixture,
      )(paramsFixture, bindingConstraintsListFixture, elementMetadataFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call curryBuildPlanServiceNodeFromClassElementMetadata()', () => {
      expect(
        curryBuildPlanServiceNodeFromClassElementMetadata,
      ).toHaveBeenCalledExactlyOnceWith(buildServiceNodeBindingsFixture);
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });
});
