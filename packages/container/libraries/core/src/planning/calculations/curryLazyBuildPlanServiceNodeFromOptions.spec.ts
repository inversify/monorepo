import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

vitest.mock(import('./curryBuildPlanServiceNodeFromOptions.js'));

import { type Binding } from '../../binding/models/Binding.js';
import { type InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation.js';
import { type SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList.js';
import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { type BasePlanParams } from '../models/BasePlanParams.js';
import { type BindingNodeParent } from '../models/BindingNodeParent.js';
import { type BuildServiceNodeOptions } from '../models/BuildServiceNodeOptions.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { type SubplanParams } from '../models/SubplanParams.js';
import { curryBuildPlanServiceNodeFromOptions } from './curryBuildPlanServiceNodeFromOptions.js';
import { curryLazyBuildPlanServiceNodeFromOptions } from './curryLazyBuildPlanServiceNodeFromOptions.js';

describe(curryLazyBuildPlanServiceNodeFromOptions, () => {
  let buildServiceNodeBindingsMock: Mock<
    (
      params: BasePlanParams,
      bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
      serviceBindings: Binding<unknown>[],
      parentNode: BindingNodeParent,
      opitons: BuildServiceNodeOptions,
    ) => PlanBindingNode[]
  >;

  let paramsFixture: SubplanParams;
  let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;
  let optionsFixture: BuildServiceNodeOptions;

  beforeAll(() => {
    buildServiceNodeBindingsMock = vitest.fn();

    paramsFixture = Symbol() as unknown as SubplanParams;
    bindingConstraintsListFixture =
      Symbol() as unknown as SingleImmutableLinkedList<InternalBindingConstraints>;
    optionsFixture = Symbol() as unknown as BuildServiceNodeOptions;
  });

  describe('when called', () => {
    let buildPlanServiceNodeFromOptionsMock: Mock<
      (
        params: SubplanParams,
        bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
        options: BuildServiceNodeOptions,
      ) => PlanServiceNode
    >;

    let planServiceNodeFixture: PlanServiceNode;

    let result: unknown;

    beforeAll(() => {
      planServiceNodeFixture = Symbol() as unknown as PlanServiceNode;

      buildPlanServiceNodeFromOptionsMock = vitest
        .fn()
        .mockReturnValueOnce(planServiceNodeFixture);

      vitest
        .mocked(curryBuildPlanServiceNodeFromOptions)
        .mockReturnValueOnce(buildPlanServiceNodeFromOptionsMock);

      result = curryLazyBuildPlanServiceNodeFromOptions(
        buildServiceNodeBindingsMock,
      )(paramsFixture, bindingConstraintsListFixture, optionsFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call curryBuildPlanServiceNodeFromOptions()', () => {
      expect(
        curryBuildPlanServiceNodeFromOptions,
      ).toHaveBeenCalledExactlyOnceWith(buildServiceNodeBindingsMock);
    });

    it('should return a PlanServiceNode', () => {
      expect(result).toBe(planServiceNodeFixture);
    });
  });

  describe('when called, and buildPlanServiceNodeFromClassElementMetadata() throws an Error', () => {
    let buildPlanServiceNodeFromOptionsMock: Mock<
      (
        params: SubplanParams,
        bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
        options: BuildServiceNodeOptions,
      ) => PlanServiceNode
    >;

    let errorFixture: Error;

    let result: unknown;

    beforeAll(() => {
      errorFixture = new Error('Test error');

      buildPlanServiceNodeFromOptionsMock = vitest
        .fn()
        .mockImplementationOnce((): never => {
          throw errorFixture;
        });

      vitest
        .mocked(curryBuildPlanServiceNodeFromOptions)
        .mockReturnValueOnce(buildPlanServiceNodeFromOptionsMock);

      try {
        curryLazyBuildPlanServiceNodeFromOptions(buildServiceNodeBindingsMock)(
          paramsFixture,
          bindingConstraintsListFixture,
          optionsFixture,
        );
      } catch (error: unknown) {
        result = error;
      }
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call curryBuildPlanServiceNodeFromOptions()', () => {
      expect(
        curryBuildPlanServiceNodeFromOptions,
      ).toHaveBeenCalledExactlyOnceWith(buildServiceNodeBindingsMock);
    });

    it('should throw an Error', () => {
      expect(result).toBe(errorFixture);
    });
  });

  describe('when called, and buildPlanServiceNodeFromClassElementMetadata() throws an InversifyCoreError', () => {
    let buildPlanServiceNodeFromOptionsMock: Mock<
      (
        params: SubplanParams,
        bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
        options: BuildServiceNodeOptions,
      ) => PlanServiceNode
    >;

    let errorFixture: InversifyCoreError;

    let result: unknown;

    beforeAll(() => {
      errorFixture = new InversifyCoreError(
        InversifyCoreErrorKind.planning,
        'Test error',
      );

      buildPlanServiceNodeFromOptionsMock = vitest
        .fn()
        .mockImplementationOnce((): never => {
          throw errorFixture;
        });

      vitest
        .mocked(curryBuildPlanServiceNodeFromOptions)
        .mockReturnValueOnce(buildPlanServiceNodeFromOptionsMock);

      result = curryLazyBuildPlanServiceNodeFromOptions(
        buildServiceNodeBindingsMock,
      )(paramsFixture, bindingConstraintsListFixture, optionsFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call curryBuildPlanServiceNodeFromOptions()', () => {
      expect(
        curryBuildPlanServiceNodeFromOptions,
      ).toHaveBeenCalledExactlyOnceWith(buildServiceNodeBindingsMock);
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });
});
