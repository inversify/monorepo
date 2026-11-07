import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

vitest.mock(import('./buildInstanceBindingInspection.js'));
vitest.mock(import('./buildResolvedValueBindingInspection.js'));
vitest.mock(import('./buildScopedBindingInspection.js'));
vitest.mock(import('./buildServiceRedirectionBindingInspection.js'));

import {
  type BindingType,
  bindingTypeValues,
} from '../../binding/models/BindingType.js';
import { type BuildServiceNodeOptions } from '../../planning/models/BuildServiceNodeOptions.js';
import { type PlanBindingNode } from '../../planning/models/PlanBindingNode.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type PlanBindingInspection } from '../models/PlanBindingInspection.js';
import { type PlanServiceInspection } from '../models/PlanServiceInspection.js';
import { buildInstanceBindingInspection } from './buildInstanceBindingInspection.js';
import { buildResolvedValueBindingInspection } from './buildResolvedValueBindingInspection.js';
import { buildScopedBindingInspection } from './buildScopedBindingInspection.js';
import { buildServiceRedirectionBindingInspection } from './buildServiceRedirectionBindingInspection.js';
import { curryBuildPlanBindingInspection } from './curryBuildPlanBindingInspection.js';

describe(curryBuildPlanBindingInspection, () => {
  let buildPlanServiceInspectionMock: Mock<
    (
      serviceInspections: Map<PlanServiceNode, PlanServiceInspection>,
      serviceNode: PlanServiceNode,
      options: BuildServiceNodeOptions,
    ) => PlanServiceInspection
  >;

  let buildPlanBindingInspection: (
    serviceInspections: Map<PlanServiceNode, PlanServiceInspection>,
    bindingNode: PlanBindingNode,
    options: BuildServiceNodeOptions,
  ) => PlanBindingInspection;

  let serviceInspectionsFixture: Map<PlanServiceNode, PlanServiceInspection>;
  let optionsFixture: BuildServiceNodeOptions;

  beforeAll(() => {
    buildPlanServiceInspectionMock = vitest.fn();

    buildPlanBindingInspection = curryBuildPlanBindingInspection(
      buildPlanServiceInspectionMock,
    );

    serviceInspectionsFixture = new Map();
    optionsFixture = Symbol() as unknown as BuildServiceNodeOptions;
  });

  function buildBindingNodeFixture(type: BindingType): PlanBindingNode {
    return {
      binding: {
        type,
      },
    } as Partial<PlanBindingNode> as PlanBindingNode;
  }

  describe.each<[BindingType]>([
    [bindingTypeValues.ConstantValue],
    [bindingTypeValues.DynamicValue],
    [bindingTypeValues.Factory],
  ])('having a PlanBindingNode with %s binding', (type: BindingType) => {
    let bindingNodeFixture: PlanBindingNode;

    beforeAll(() => {
      bindingNodeFixture = buildBindingNodeFixture(type);
    });

    describe('when called', () => {
      let bindingInspectionFixture: PlanBindingInspection;

      let result: unknown;

      beforeAll(() => {
        bindingInspectionFixture = Symbol() as unknown as PlanBindingInspection;

        vitest
          .mocked(buildScopedBindingInspection)
          .mockReturnValueOnce(
            bindingInspectionFixture as ReturnType<
              typeof buildScopedBindingInspection
            >,
          );

        result = buildPlanBindingInspection(
          serviceInspectionsFixture,
          bindingNodeFixture,
          optionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildScopedBindingInspection()', () => {
        expect(buildScopedBindingInspection).toHaveBeenCalledExactlyOnceWith(
          bindingNodeFixture.binding,
        );
      });

      it('should return a PlanBindingInspection', () => {
        expect(result).toBe(bindingInspectionFixture);
      });
    });
  });

  describe('having a PlanBindingNode with Instance binding', () => {
    let bindingNodeFixture: PlanBindingNode;

    beforeAll(() => {
      bindingNodeFixture = buildBindingNodeFixture(bindingTypeValues.Instance);
    });

    describe('when called', () => {
      let bindingInspectionFixture: PlanBindingInspection;

      let result: unknown;

      beforeAll(() => {
        bindingInspectionFixture = Symbol() as unknown as PlanBindingInspection;

        vitest
          .mocked(buildInstanceBindingInspection)
          .mockReturnValueOnce(
            bindingInspectionFixture as ReturnType<
              typeof buildInstanceBindingInspection
            >,
          );

        result = buildPlanBindingInspection(
          serviceInspectionsFixture,
          bindingNodeFixture,
          optionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildInstanceBindingInspection()', () => {
        expect(buildInstanceBindingInspection).toHaveBeenCalledExactlyOnceWith(
          buildPlanServiceInspectionMock,
          serviceInspectionsFixture,
          bindingNodeFixture,
        );
      });

      it('should return a PlanBindingInspection', () => {
        expect(result).toBe(bindingInspectionFixture);
      });
    });
  });

  describe('having a PlanBindingNode with ResolvedValue binding', () => {
    let bindingNodeFixture: PlanBindingNode;

    beforeAll(() => {
      bindingNodeFixture = buildBindingNodeFixture(
        bindingTypeValues.ResolvedValue,
      );
    });

    describe('when called', () => {
      let bindingInspectionFixture: PlanBindingInspection;

      let result: unknown;

      beforeAll(() => {
        bindingInspectionFixture = Symbol() as unknown as PlanBindingInspection;

        vitest
          .mocked(buildResolvedValueBindingInspection)
          .mockReturnValueOnce(
            bindingInspectionFixture as ReturnType<
              typeof buildResolvedValueBindingInspection
            >,
          );

        result = buildPlanBindingInspection(
          serviceInspectionsFixture,
          bindingNodeFixture,
          optionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildResolvedValueBindingInspection()', () => {
        expect(
          buildResolvedValueBindingInspection,
        ).toHaveBeenCalledExactlyOnceWith(
          buildPlanServiceInspectionMock,
          serviceInspectionsFixture,
          bindingNodeFixture,
        );
      });

      it('should return a PlanBindingInspection', () => {
        expect(result).toBe(bindingInspectionFixture);
      });
    });
  });

  describe('having a PlanBindingNode with ServiceRedirection binding', () => {
    let bindingNodeFixture: PlanBindingNode;

    beforeAll(() => {
      bindingNodeFixture = buildBindingNodeFixture(
        bindingTypeValues.ServiceRedirection,
      );
    });

    describe('when called', () => {
      let bindingInspectionFixture: PlanBindingInspection;

      let result: unknown;

      beforeAll(() => {
        bindingInspectionFixture = Symbol() as unknown as PlanBindingInspection;

        vitest
          .mocked(buildServiceRedirectionBindingInspection)
          .mockReturnValueOnce(
            bindingInspectionFixture as ReturnType<
              typeof buildServiceRedirectionBindingInspection
            >,
          );

        result = buildPlanBindingInspection(
          serviceInspectionsFixture,
          bindingNodeFixture,
          optionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildServiceRedirectionBindingInspection()', () => {
        expect(
          buildServiceRedirectionBindingInspection,
        ).toHaveBeenCalledExactlyOnceWith(
          buildPlanServiceInspectionMock,
          serviceInspectionsFixture,
          bindingNodeFixture,
          optionsFixture,
        );
      });

      it('should return a PlanBindingInspection', () => {
        expect(result).toBe(bindingInspectionFixture);
      });
    });
  });
});
